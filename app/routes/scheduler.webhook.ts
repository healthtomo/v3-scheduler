import { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import configServer from "~/models/config.server";

// type EventWebhookBody = {
//     grant_id: string;
//     event_id: string;
//     calendar_id: string;
//     type: string;
// };

export async function loader({ request }: LoaderFunctionArgs) {
    const url = new URL(request.url);

    const challenge = url.searchParams.get("challenge");

    if (!challenge) {
        return new Response(null, {
            status: 400,
        });
    }

    if (!configServer.BUBBLE_WEBHOOK_ENDPOINT) {
        return new Response(null, {
            status: 400,
        });
    }

    // call the bubble endpoint to initialize it with the id and type
    const bubbleInitResponse = await fetch(`${configServer.BUBBLE_WEBHOOK_ENDPOINT}/initalize`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            grant_id: "string",
            event_id: "string",
            calendar_id: "string",
            type: "string",
        }),
    });

    if (bubbleInitResponse.status !== 200) {
        return new Response(null, {
            status: 400,
        });
    }

    return new Response(challenge, {
        status: 200,
    });
}

export async function action({ request }: ActionFunctionArgs) {
    const webhookData = await request.json();
    console.log(JSON.stringify(webhookData, null, 2));
    const body = {
        grant_id: webhookData?.data?.grant_id ?? "",
        event_id: webhookData?.data?.object?.id ?? "",
        calendar_id: webhookData?.data?.object?.calendar_id ?? "",
        type: webhookData.type
    }

    console.log(body);

    if (!configServer.BUBBLE_WEBHOOK_ENDPOINT) {
        return new Response(null, {
            status: 400,
        });
    }

    await fetch(`${configServer.BUBBLE_WEBHOOK_ENDPOINT}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    });

    return new Response(null, {
        status: 200,
    });
}
