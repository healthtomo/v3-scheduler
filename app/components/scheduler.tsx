import { useCallback, useMemo } from "react";
import { ClientOnly } from "remix-utils/client-only";
import FallBack from "./fallback";
import Scheduler from "./nylas-react.client";

interface CustomEvent<T = unknown> extends Event {
    readonly detail: T;
}

type NylasSchedulingCustomEvent<T> = CustomEvent<T>;

export type SchedulerCustomQueryParams = {
    name: string;
    email: string;
};

type NylasCustomSchedulerProps = {
    configId: string;
    bookingId?: string;
    cancelFlow?: boolean;
    rescheduleFlow?: boolean;
    sessionId?: string;
    queryParams?: SchedulerCustomQueryParams;
    domain: string;
};

interface CustomEvent<T = unknown> extends Event {
    readonly detail: T;
}

export default function NylasCustomScheduler({
    configId,
    bookingId = "",
    cancelFlow = false,
    rescheduleFlow = false,
    sessionId,
    queryParams,
    domain,
}: NylasCustomSchedulerProps) {
    const commonEventHander = async (e: CustomEvent, connector?: unknown) => {
        e.preventDefault();

        console.log("Any event", e);
        console.log("connector", connector);
    };

    const onBookingRefExtracted = (
        event: NylasSchedulingCustomEvent<{
            configurationId: string;
            bookingId: string;
        }>
    ) => {
        console.log("Config ID", event.detail.configurationId),
            console.log("BookingID", event.detail.bookingId);
    };

    const bookingInfo = useCallback(() => {
        if (cancelFlow || !queryParams) {
            return undefined;
        }

        const { name, email } = queryParams;

        if (email && name) {
            return {
                primaryParticipant: {
                    name,
                    email,
                },
            };
        }
    }, [cancelFlow, queryParams]);

    const props = useMemo(() => {
        if (sessionId) {
            return {
                sessionId,
                bookingInfo: bookingInfo(),
            };
        }

        return {
            configurationId: configId,
            bookingInfo: bookingInfo(),
        };
    }, [sessionId, bookingInfo, configId]);

    return (
        <div className=" m-auto flex flex-col h-full items-center justify-center bg-white">
            <div className="flex flex-col items-left">
                <div className="mb-4 !max-w-[260px]">
                    <img src="/full_logo.avif" alt="Logo" />
                </div>
                <ClientOnly fallback={<FallBack />}>
                    {() => {
                        return (
                            <Scheduler.NylasScheduling
                                schedulerApiUrl={domain}
                                nylasBranding={false}
                                onBookingRefExtracted={onBookingRefExtracted}
                                eventOverrides={{
                                    detailsConfirmed: commonEventHander,
                                    bookingInfo: commonEventHander,
                                    //bookingFormSubmitted: commonEventHander,

                                }}
                                onBookedEventInfo={(event: CustomEvent) => {
                                    console.log(event);
                                }}
                                {...(cancelFlow && { cancelBookingRef: bookingId })}
                                {...(rescheduleFlow && { rescheduleBookingRef: bookingId })}
                                {...props}
                                themeConfig={{
                                    "--nylas-primary": "#DF403F",
                                    "--nylas-base-500": "#DF403F",
                                }}
                            ></Scheduler.NylasScheduling>
                        );
                    }}
                </ClientOnly>
            </div>
        </div>
    );
}
