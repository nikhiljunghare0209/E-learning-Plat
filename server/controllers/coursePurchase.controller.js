import Stripe from "stripe";
import { Course } from "../models/course.model.js";
import { CoursePurchase } from "../models/coursePurchase.model.js";
import { Lecture } from "../models/lecture.model.js";
import { User } from "../models/user.model.js";
// In below statement we create object of name strip.
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

//💡 BELOW THEORY EXPLAIN THE COMPLETE FLOW OF PAYMENT PROCESSING USING STRIPE
/*
1. User clicks “Buy” on the Frontend
The frontend sends a POST request to your backend API at /checkout/create-checkout-session.
Purpose: Tell the backend, “I want to buy this course.”

2. Backend → Stripe: Create Checkout Session
Your createCheckoutSession controller calls Stripe’s API to create a Checkout Session.
This session contains:
Course details
Price
Success & cancel URLs
User info (optional)
Purpose: This is like telling Stripe, “Please prepare a payment page for this purchase.” 

3. Backend → Frontend: Return Stripe Checkout URL
Stripe returns a session.url to your backend.
Backend sends this URL to the frontend in the API response.
Purpose: Give the frontend the special Stripe-hosted payment link.

4. Frontend redirects user to Stripe Checkout
The user is now on a Stripe-hosted payment page.
They enter card details and complete the payment.
Purpose: Stripe securely handles payment (you never see the card number).

5. Stripe processes payment
If payment is successful, Stripe prepares a checkout.session.completed event.

6. Stripe → Backend: Send Webhook Event
Stripe sends a POST request to your /webhook endpoint.
This call is from Stripe to your backend, not from your frontend.
The request includes all payment details (session ID, amount, etc.).
Purpose: This is Stripe’s way of saying, “Payment is done! Update your database.”

7. Backend webhook controller (stripeWebhook)
Verifies that the event came from Stripe (using WEBHOOK_ENDPOINT_SECRET).
Finds the matching purchase in your DB.
Updates purchase status from "pending" → "completed".
Makes course lectures available to the user.
Adds the course to the user’s enrolledCourses list.
Adds the user to the course’s enrolledStudents list.
Purpose: Fulfill the order after successful payment.

8. Frontend success page
Stripe redirects the user to your success URL (given in step 2).
The frontend can now fetch updated user data (enrolled courses) from your backend.
✅ Why this setup is important
Security → Payment info never touches your server; Stripe handles it.
Reliability → Even if the user closes their browser after payment, the webhook ensures your DB still updates.
Automation → Webhook automatically unlocks the course when payment succeeds.
*/

// IN BELOW WHY We create this payment session because Stripe needs a secure, temporary “checkout room” for the user to enter their payment details.

// Without it:
// Your server would have to handle sensitive card data (unsafe and not PCI-compliant).
// You’d have to manually handle payment logic, currency conversion, and fraud checks.

// With it:
// Stripe hosts the payment page securely.
// You just pass course info (name, price, image) to Stripe.
// Stripe handles card processing, currency, and security.
// Once payment succeeds, Stripe notifies your backend (via webhook) so you can mark the course as purchased.

export const createCheckoutSession = async (req, res) => {

  try {
    const userId = req.id;
    const { courseId } = req.body;
    //try
// This adds the course to the user before any payment happens.
      const user = await User.findById(userId)
      user.enrolledCourses.push(courseId)
      console.log(user)
      await user.save()  
    //end



    // By below statement we find course by courseId
    const course = await Course.findById(courseId);
    // below if statement run if course is not found
    if (!course) return res.status(404).json({ message: "Course not found!" });
    
    // if course found then we Create a new course purchase record.
    // in below statement we create object of CoursePurchase schema
    const newPurchase = new CoursePurchase({
      courseId,
      userId,
      amount: course.coursePrice,
      status: "pending",
    });

    // Create a Stripe checkout session

// 1) Create a Checkout Session (server-side)
        // stripe.checkout.sessions.create({...}) calls Stripe’s API (using your secret key on the server) to create a Checkout Session.
        // Stripe returns a session object (includes id and url). You’ll redirect the user to session.url.

    const session = await stripe.checkout.sessions.create({
      // Tells Stripe which payment methods to show on the Checkout page.
      // Here it only allows card payments.
      // (Optional) In India you can also enable UPI etc., e.g. ["card","upi"] if enabled in your Stripe account.
      payment_method_types: ["card"],
// 3) line_items: [...]
// Defines what the customer is paying for.

// a) price_data
// You’re creating an on-the-fly (ad hoc) price for a one-time payment:

// currency: "inr"
// The charge will be in Indian Rupees.

// product_data: { name, images }
// name: course.courseTitle → What appears on the Stripe checkout line item.
// images: [course.courseThumbnail] → Publicly accessible HTTPS image URL to show on checkout.
// If it’s not a public HTTPS URL, Stripe won’t display it.

// unit_amount: course.coursePrice * 100
// Stripe expects the smallest currency unit (paise for INR).
// If your coursePrice is 499.00, you must send 49900.
// Tip: guard against floating-point issues: Math.round(course.coursePrice * 100).

// b) quantity: 1
// Buying one of this item. If you ever allowed multiple seats, you’d change this number.

      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: course.courseTitle,
              images: [course.courseThumbnail],
            },
            unit_amount: course.coursePrice * 100, // Amount in paise (lowest denomination)
          },
          quantity: 1,
        },
      ],
// 4) mode: "payment"
    // This is a one-time payment (Stripe will create a PaymentIntent under the hood).
    // Other modes include "subscription" (recurring) or "setup" (save a payment method).

      mode: "payment",
      // success_url: `http://localhost:5173/course-progress/${courseId}`, // once payment successful redirect to course progress page
      // cancel_url: `http://localhost:5173/course-detail/${courseId}`,
      // OR
      success_url: `${process.env.FRONTEND_URL}/course-progress/${courseId}`,
      cancel_url:  `${process.env.FRONTEND_URL}/course-detail/${courseId}`,

//6) metadata: { courseId, userId }
// Attaches your own identifiers to the Stripe session.
// This metadata travels with Stripe events (like webhooks).
// When Stripe notifies your server (checkout.session.completed), you can read metadata.courseId and metadata.userId to find the right user/course and update your DB.

      metadata: {
        courseId: courseId,
        userId: userId,
      },
// 7) shipping_address_collection: { allowed_countries: ["IN"] }
    // Asks Stripe Checkout to collect a shipping address and restricts it to India.
    // For digital courses, shipping isn’t usually needed; you might collect billing instead (tax/GST). You can remove this if it’s not required.
      shipping_address_collection: {
        allowed_countries: ["IN"], // Optionally restrict allowed countries
      },
    });
    if (!session.url) {
      return res
        .status(400)
        .json({ success: false, message: "Error while creating session" });
    }

    // Save the purchase record
    newPurchase.paymentId = session.id;
    await newPurchase.save();

//8) What you receive back
    // If successful, Stripe returns a session object:
    // session.id → store this as paymentId in your DB (you already do this)
    // session.url → redirect the user’s browser to this URL to pay


    return res.status(200).json({
      success: true,
      url: session.url, // Return the Stripe checkout URL
    });
// 9) What happens next (big picture)
  // Frontend redirects to session.url (Stripe-hosted page).
  // Customer completes payment.
  // Stripe redirects the browser to your success_url.
  // Separately, Stripe sends a webhook (checkout.session.completed) to your backend.
  // In the webhook handler, you:
    // Verify the event signature.
    // Look up the purchase by paymentId = session.id.
    // Mark it paid, then enroll the user in the course.
    // (This is the correct time to add to enrolledCoures.)
    // ⚠️ Do not enroll the user before the webhook confirms payment.    
    
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
};


// business logic to use stripe webhook

// when we done payment then payment information is present in strip.when we want to recive information of payment(successfull/unsuccessful) from strip then we used 'webhook'.

// We will store the Stripe event (payment success/failure data) in this variable.
// Why? Stripe sends a lot of details when it calls our webhook. We keep it in event so we can use it later.
// stripeWebhook is the endpoint that Stripe will call to notify us about payment events.
export const stripeWebhook = async (req, res) => {
  let event;

  try {
// req.body = the raw data Stripe sends to our webhook.
// JSON.stringify(..., null, 2) = makes it a pretty JSON string (just for clean handling here).
// secret = the secret key that only Stripe and your backend know. It’s stored in .env so it’s not public.
// Why? We need to verify that this request actually came from Stripe, not from a hacker.
    const payloadString = JSON.stringify(req.body, null, 2);
    const secret = process.env.WEBHOOK_ENDPOINT_SECRET;

// This creates a Stripe-style signature header for testing purposes.
// In real production, Stripe sends the signature automatically, but in test mode we simulate it.
// Why? Webhook calls must be verified — otherwise, anyone could hit your endpoint pretending they paid.
    const header = stripe.webhooks.generateTestHeaderString({
      payload: payloadString,
      secret,
    });

// Stripe checks the signature and payload with your secret key.
// If verification fails, it will throw an error.
// Why? This step ensures the payment notification really came from Stripe and not someone spoofing it.
    event = stripe.webhooks.constructEvent(payloadString, header, secret);


  } catch (error) {

    // If verification fails, log the error and stop processing.
// Why? If we can’t trust the sender, we should not give them access to our payment logic.
    console.error("Webhook error:", error.message);
    return res.status(400).send(`Webhook error: ${error.message}`);
  }

  // Handle the checkout session completed event
  // Stripe sends different event types (payment_failed, payment_intent.succeeded, etc.).
  // Here we only act if the checkout session completed successfully.
  // Why? We only give access to the course when the payment is complete.
  if (event.type === "checkout.session.completed") {
    console.log("check session complete is called");

    try {

      // event.data.object contains all the details of the payment session (amount, payment ID, etc.).
      // Why? We’ll use this data to match the payment to a purchase in our database.
      const session = event.data.object;

//Search our CoursePurchase collection for the purchase that matches this payment session ID.
// .populate("courseId") → replaces courseId with actual course details.
// Why? We stored a "pending" purchase when the user clicked Buy. Now we find it to update its status.
      const purchase = await CoursePurchase.findOne({
        paymentId: session.id,
      }).populate({ path: "courseId" });

// If we don’t find a matching pending purchase, something is wrong — maybe the session expired.
// Why? Prevents updating the wrong record.
      if (!purchase) {
        return res.status(404).json({ message: "Purchase not found" });
      }

//Update the amount paid (convert cents → rupees/dollars).
//Set status to "completed".
//Why? This marks the purchase as successfully paid.
      if (session.amount_total) {
        purchase.amount = session.amount_total / 100;
      }
      purchase.status = "completed";

     // Make all course lectures available (isPreviewFree = true).
     //Why? Before payment, lectures might be locked. After payment, all are unlocked.
      if (purchase.courseId && purchase.courseId.lectures.length > 0) {
        await Lecture.updateMany(
          { _id: { $in: purchase.courseId.lectures } },
          { $set: { isPreviewFree: true } }
        );
      }
//Save updated purchase details in the database.
//Why? So we have a record of completed transactions.
      await purchase.save();

      // Update user's enrolledCourses
      await User.findByIdAndUpdate(
        purchase.userId,
        { $addToSet: { enrolledCourses: purchase.courseId._id } }, // Add course ID to enrolledCourses
        { new: true }
      );

     //Add the user to the course’s list of enrolled students.
     //Why? Useful for analytics, certificates, and course management.
      await Course.findByIdAndUpdate(
        purchase.courseId._id,
        { $addToSet: { enrolledStudents: purchase.userId } }, // Add user ID to enrolledStudents
        { new: true }
      );
    } catch (error) {
      console.error("Error handling event:", error);
      return res.status(500).json({ message: "Internal Server Error" });
    }
  }
  //well Stripe that we processed the webhook successfully.
  //Why? If we don’t respond with 200, Stripe will retry sending the webhook.
  res.status(200).send();
};

// IN BELOW controller we define "course" varible which store data related course -> creator -> lectures as given below

// {
//   _id: "abc123",
//   title: "React for Beginners",
//   description: "A complete React course for beginners...",
//   price: 499,
//   thumbnail: "react-course.jpg",

//   creator: {
//     _id: "user456",
//     name: "John Doe",
//     email: "john@example.com",
//     // other User fields...
//   },

//   lectures: [
//     {
//       _id: "lec001",
//       title: "Introduction to React",
//       videoUrl: "https://...",
//       isPreviewFree: true,
//       // other lecture fields...
//     },
//     {
//       _id: "lec002",
//       title: "JSX and Rendering",
//       videoUrl: "https://...",
//       isPreviewFree: false,
//     },
//     // more lectures...
//   ],

//   __v: 0
// }

export const getCourseDetailWithPurchaseStatus = async (req, res) => {
  try {
   // courseId → Comes from the URL path (e.g., /course-detail/12345).
    const { courseId } = req.params;

    // req.id → Comes from the authenticated user (e.g., the user who is making the request).
    // req.id is typically set by middleware that authenticates the user, such as a JWT authentication middleware.
    const userId = req.id;

// What’s happening in Step  — .populate()
// Why we even need populate

// In MongoDB + Mongoose, when you store related data, you don’t usually embed the whole document inside another document (that would be huge and duplicate data).
// Instead, you store only the ObjectId reference to another collection.

// Example:
// A Course document might look like this in MongoDB:

// {
//   "_id": "c101",
//   "title": "React Basics",
//   "creator": "u55",        // ObjectId of the creator in Users collection
//   "lectures": ["l1", "l2"] // Array of ObjectIds from Lectures collection
// }

// Without populate, if we fetch this course, we only get IDs (u55, l1, l2) — not the actual details.

// What .populate() does
// populate({ path: "creator" }) → Looks at the creator field in the course, finds that u55 in the User collection, and replaces it with the full user document:

// "creator": {
//   "_id": "u55",
//   "name": "John Doe",
//   "email": "john@example.com"
// }


// populate({ path: "lectures" }) → Takes all the lecture IDs from lectures array, looks in the Lecture collection, and replaces each ID with the full lecture object:
// "lectures": [
//   { "_id": "l1", "title": "Intro to React", "videoUrl": "..." },
//   { "_id": "l2", "title": "JSX Deep Dive", "videoUrl": "..." }
// ]

// Why we want this
// Without populate → Frontend would have to make extra API calls to get creator details and lectures separately (slower).
// With populate → We get everything in one single query → faster, cleaner API response.
// This means your CourseDetail component can directly show:

// Instructor name
// Lecture list with video titles
// without fetching them one by one.

// How the code works internally
// Course.findById(courseId) → Gets the course document from the courses collection.
// .populate("creator") → Mongoose sees "creator" is a reference (ref) to the User model and fetches that user.
// .populate("lectures") → Mongoose sees "lectures" is an array of references to the Lecture model and fetches them all.

// Mongoose merges that data into the course object before sending it back.


    const course = await Course.findById(courseId)
      .populate({ path: "creator" })
      .populate({ path: "lectures" });

    const purchased = await CoursePurchase.findOne({ userId, courseId });
    console.log(purchased);

    if (!course) {
      return res.status(404).json({ message: "course not found!" });
    }

    return res.status(200).json({
      course,
      purchased: !!purchased, // true if purchased, false otherwise
    });
  } catch (error) {
    console.log(error);
  }
};


export const getAllPurchasedCourse = async (_, res) => {
  try {

// below code  queries the CoursePurchase model to find all documents where the status is "completed".
// These are the records where users have successfully purchased and completed a course.
// .populate("courseId") is used to replace the courseId field (which normally contains only an ObjectId) with the actual full course document from the Course collection.

// 🔁 Why .populate("courseId") is used?
// In MongoDB with Mongoose, if you have a document like this:

// {
//   userId: "abc123",
//   courseId: "xyz456",
//   status: "completed"
// }
// Normally, courseId just stores the reference ID. With .populate("courseId"), you get:

// {
//   userId: "abc123",
//   courseId: {
//     _id: "xyz456",
//     title: "React for Beginners",
//     price: 499,
//     description: "...",
//     // other course fields
//   },
//   status: "completed"
// }
// This makes it easier to directly access course details in the response without needing another manual query.
// Each item in the purchasedCourse array will look like shown in above example.

    const purchasedCourse = await CoursePurchase.find({
      status: "completed",            
    }).populate("courseId");
    if (!purchasedCourse) {
      return res.status(404).json({
        purchasedCourse: [],
      });
    }
    return res.status(200).json({
      purchasedCourse,
    });
  } catch (error) {
    console.log(error);
  }                     
};



//💡 STRIPE INFORMATION

// If you do payment without Stripe (Self-managed payment gateway)

// Advantages
   // Full Control – You manage the entire payment flow, design, and logic.
   // No extra platform fees (except bank charges).
   // Custom integrations for your specific business rules.

// Disadvantages (and why most developers avoid it)
    // Security Risks – You must securely handle card numbers, CVV, expiry dates (which means you store sensitive data). This is very risky.
    // PCI-DSS Compliance – Legally, if you process credit card data, you must meet strict international security standards (audits, encryption, secure servers, etc.). This is costly and complex.
    // Fraud Handling – You have to detect and prevent fraudulent transactions yourself.
    // No Built-in Payment UI – You must create the entire payment form, validation, and error handling.
    // International Payment Issues – Currency conversion, tax calculation, and banking regulations become your headache.

// If you use Stripe (or similar like Razorpay, PayPal)
    // You never store card data → Stripe handles all sensitive info.
    // Already PCI-compliant → No extra legal hassle.
    // Built-in fraud protection → Fewer chargebacks.
    // Easy integration → Few lines of code for payments.
    // Supports multiple payment methods (Cards, UPI, Wallets, etc.).

// 💡 In short:
    // Without Stripe → More control but huge responsibility + legal risk.
    // With Stripe → Less control over UI but super safe, faster to implement, and legally compliant.