import { z } from "zod";

const requiredString = (fieldName: string) =>
  z
    .string({ required_error: `${fieldName} is required` })
    .min(1, `${fieldName} is required`);

export const activitySchema = z.object({
  title: requiredString("Title"),
  description: requiredString("Description"),
  category: requiredString("Category"),
  // DateTimePicker works in Date objects, not strings, and hands back null once
  // cleared. ActivityForm converts the API's ISO string before reset().
  date: z.coerce.date({
    required_error: "Date is required",
    invalid_type_error: "Date is required",
  }),
  city: requiredString("City"),
  venue: requiredString("Venue"),
});

export type ActivitySchema = z.infer<typeof activitySchema>;
