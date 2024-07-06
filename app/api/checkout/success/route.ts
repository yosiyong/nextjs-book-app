import prisma from "@/app/lib/prisma";
import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// 購入履歴保存
export async function POST(req: Request, res: Response) {
    
    const { sessionId } = await req.json();
    //console.log('server sessionId:',sessionId);
    try {
        // session情報取得
        const session = await stripe.checkout.sessions.retrieve(sessionId);

        //console.log('session.client_reference_id:',session.client_reference_id);
        //console.log('session.metadata?.bookId!:',session.metadata?.bookId!);
        
        // 既に同じデータが保存済みかチェック
        const existingPurchase = await prisma.purchase.findFirst({
            where: {
              userId: session.client_reference_id!,
              bookId: session.metadata?.bookId!,
            },
          });

        if (!existingPurchase) {
            // 存在しない場合、購入履歴保存
            const purchase = await prisma.purchase.create({
                data: {
                    userId: session.client_reference_id!,
                    bookId: session.metadata?.bookId!,
                },
            });
    
            return NextResponse.json({ purchase });
        }else{
            return NextResponse.json({ message: "既に購入済みです。"});
        }

    } catch (err) {
        return NextResponse.json(err);
    }
    
}