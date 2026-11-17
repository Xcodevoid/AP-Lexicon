import { route } from "@/lib/api";
import { saveTerm, termEditSchema } from "@/lib/services/admin";

export const POST = route({ permission: "content:write", body: termEditSchema }, async ({ body }) => saveTerm(null, body));
