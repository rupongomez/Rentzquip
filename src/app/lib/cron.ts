import cron from "node-cron";
import { prisma } from "./prisma";
import { differenceInDays, isPast } from "date-fns";
import config from "../config";

export const updateLateFeeCronJob = async () => {
  cron.schedule(" 0 1 * * *", async () => {
    //
    try {
      const lateFeeRate = Number(config.late_fee_rate);

      const getRentalData = await prisma.rental.findMany();
      // const isRentalOverdue = isPast(new Date(getRentalData[0].endDate))
      const isRentalOverdue = getRentalData.map((rental) => {
        if (
          rental.rentalStatus === "ONGOING" &&
          isPast(new Date(rental.endDate))
        ) {
          const daysLate = differenceInDays(
            new Date(),
            new Date(rental.endDate),
          );
          console.log(daysLate, " days late for rental ID:", rental.id);

          const updateRental = prisma.rental.update({
            where: { id: rental.id },
            data: {
              lateFee:
                Number(rental.rentalDays) *
                daysLate *
                Number(rental.rentalAmount) *
                lateFeeRate,
            },
          });
          return updateRental;
        }

        return {
          ...rental,
        };
      });
      // console.log(isRentalOverdue, "isRentalOverdue");
    } catch (error) {
      console.log(error);
    }
    console.log("Cron job running");
  });
};
