import { route } from "@/lib/api";
import { questionEditSchema, saveQuestion } from "@/lib/services/admin";
export const POST = route({ permission: "content:write", body: questionEditSchema }, async ({ body }) => saveQuestion(null, body));
