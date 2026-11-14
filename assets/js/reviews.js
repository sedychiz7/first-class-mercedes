/* =========================================================
   Customer reviews
   ---------------------------------------------------------
   Add REAL reviews only, ideally copied from Facebook / Google
   with the customer's permission. One block per review:

   {
     name:    'Tendai M.',               // first name + initial is fine
     car:     'E-Class W212',            // optional
     service: 'Airmatic suspension',     // optional, short tag
     rating:  5,                         // 1 to 5
     text:    'What they said, word for word.',
     source:  'Facebook'                 // or 'Google', 'WhatsApp'
   },

   While this list is empty, the section shows a
   "read our reviews on Facebook" message instead.
   ========================================================= */
window.FCM_REVIEWS = [

];

/* Links for the "leave a review" buttons. TODO: replace. */
window.FCM_REVIEW_LINKS = {
  facebook: '#',   // e.g. https://www.facebook.com/<page>/reviews
  google: ''       // add once the Google Business Profile exists
};
