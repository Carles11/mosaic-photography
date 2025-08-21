export async function POST(request: Request) {
  const body = await request.json();
  const { event, user } = body;

  if (event === "USER_SIGNUP" && user) {
    try {
      // EmailJS REST API endpoint
      const EMAILJS_SERVICE_ID = process.env.EMAILJS_SERVICE_ID;
      const EMAILJS_TEMPLATE_ID = process.env.EMAILJS_TEMPLATE_ID;
      const EMAILJS_PUBLIC_KEY = process.env.EMAILJS_PUBLIC_KEY;

      const emailData = {
        service_id: EMAILJS_SERVICE_ID,
        template_id: EMAILJS_TEMPLATE_ID,
        user_id: EMAILJS_PUBLIC_KEY,
        template_params: {
          to_email: "carles@rio-frances.com",
          user_email: user.email,
          user_id: user.id,
        },
      };

      const response = await fetch(
        "https://api.emailjs.com/api/v1.0/email/send",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(emailData),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        return new Response(
          JSON.stringify({ message: "Failed to send email", error: errorText }),
          { status: 500, headers: { "Content-Type": "application/json" } },
        );
      }

      return new Response(JSON.stringify({ message: "Email sent" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error) {
      return new Response(
        JSON.stringify({ message: "Failed to send email", error }),
        { status: 500, headers: { "Content-Type": "application/json" } },
      );
    }
  }

  return new Response(JSON.stringify({ message: "No action taken" }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
