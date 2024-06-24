import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Checkout処理リクエスト
export async function POST(request:Request, res: Response) {
    const {title, price, bookId, userId} = await request.json();
    try {
        // Create Checkout Sessions from body params.
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ["card"],
          metadata: {
            bookId: bookId,
          },
          client_reference_id: userId,
          line_items: [
            {
              // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
              price_data:{
                currency: "jpy",
                product_data: {
                    name: title,
                },
                unit_amount: price,  
              },
              quantity: 1,
            },
          ],
          mode: 'payment',
          success_url: `${process.env.STRIPE_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,  // strip側で自動的にCHECKOUT_SESSION_IDに値をセットしてくれる。
          cancel_url: `${process.env.STRIPE_CANCEL_URL}`,
        });

        return NextResponse.json({
            checkout_url: session.url,
          });
        //res.redirect(303, session.url);
      } catch (err: any) {
        //res.status(err.statusCode || 500).json(err.message);
        return NextResponse.json(err.message);
      }
}