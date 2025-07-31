import NotificationContent from "@/components/notifications/notification";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import Back from "@/components/notifications/back";

export default function Page(){

    return (
        <div className="ml-16 px-8 py-6 flex flex-col text-white">
            <Back/>
            <div className="mx-auto w-[85%] justify-center flex flex-col">
                <Accordion type="multiple" defaultValue={["today", "week", "before"]} className="mt-5">
                    <AccordionItem value="today" className="border-b-0">
                        <AccordionTrigger className="text-2xl">Today</AccordionTrigger>
                        <AccordionContent>
                            <NotificationContent/>
                            <NotificationContent/>
                            <NotificationContent/>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="week" className="border-b-0">
                        <AccordionTrigger className="text-2xl">This Week</AccordionTrigger>
                        <AccordionContent>
                            <NotificationContent/>
                            <NotificationContent/>
                            <NotificationContent/>
                        </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="before" className="border-b-0">
                        <AccordionTrigger className="text-2xl">Earlier</AccordionTrigger>
                        <AccordionContent>
                            <NotificationContent/>
                            <NotificationContent/>
                            <NotificationContent/>
                        </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
        </div>
    )
}