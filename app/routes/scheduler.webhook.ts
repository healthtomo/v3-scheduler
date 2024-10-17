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

    if (!configServer.BUBBLE_WEBHOOK_ENDPOINT_EVENTS) {
        return new Response(null, {
            status: 400,
        });
    }

    if (!configServer.BUBBLE_WEBHOOK_ENDPOINT_BOOKING) {
        return new Response(null, {
            status: 400,
        });
    }

    // call the bubble endpoint to initialize it with the id and type
    // const bubbleEventEndpoint = process.env.BUBBLE_WEBHOOK_ENDPOINT_EVENTS;
    // const bubbleBookingEndpoint = process.env.BUBBLE_WEBHOOK_ENDPOINT_BOOKING;
    // const bubbleBookingInitResponse = await fetch(`${bubbleBookingEndpoint}/initalize`, {
    //     method: "POST",
    //     headers: {
    //         "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({
    //         grant_id: "string",
    //         event_id: "string",
    //         calendar_id: "string",
    //         type: "string",
    //     }),
    // });

    // // if (bubbleBookingInitResponse.status !== 200) {
    // //     return new Response(null, {
    // //         status: 400,
    // //     });
    // // }

    // const bubbleEventInitResponse = await fetch(`${bubbleEventEndpoint}/initalize`, {
    //     method: "POST",
    //     headers: {
    //         "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({
    //         booking_id: "string",
    //         config_id: "string",
    //         type: "string"
    //     }),
    // });

    // if (bubbleEventInitResponse.status !== 200) {
    //     return new Response(null, {
    //         status: 400,
    //     });
    // }

    return new Response(challenge, {
        status: 200,
    });
}

export async function action({ request }: ActionFunctionArgs) {
    const webhookData = await request.json();
    let body;
    let bubbleEndpoint;
    console.log(JSON.stringify(webhookData));

    if (webhookData.type.includes("event")) {
        bubbleEndpoint = process.env.BUBBLE_WEBHOOK_ENDPOINT_EVENTS;
        body = {
            grant_id: webhookData?.data?.grant_id || "",
            event_id: webhookData?.data?.object?.id || "",
            calendar_id: webhookData?.data?.object?.calendar_id || "",
            type: webhookData.type,
            raw_body: JSON.stringify(webhookData),
        };
    } else if (webhookData.type.includes("booking")) {
        bubbleEndpoint = process.env.BUBBLE_WEBHOOK_ENDPOINT_BOOKING;

        body = {
            booking_id: webhookData?.data?.object.booking_id || "",
            config_id: webhookData?.data?.object.configuration_id || "",
            type: webhookData.type,
            booking_ref: webhookData?.data?.object?.booking_ref || "",
            additional_fields: JSON.stringify(webhookData?.data?.object.booking_info.additional_fields || {}),
            raw_body: JSON.stringify(webhookData),
        };
    }

    if (!bubbleEndpoint) {
        return new Response(null, {
            status: 400,
        });
    }

    console.log(JSON.stringify(body));
    const res = await fetch(`${bubbleEndpoint}`, {
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
