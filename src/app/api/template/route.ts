import Papa from "papaparse";
import { TEMPLATE_COLUMNS } from "@/lib/content/import";

/** Downloadable CSV import template with two example rows (public: contains no data). */
export async function GET() {
  const rows = [
    { id: "", subject: "ap-microeconomics", unit: 2, unitTitle: "Supply and Demand", topic: "2.4", topicTitle: "Market Interventions", term: "excise tax", zh: "消费税（从量税）", definition: "A tax charged on each unit of a specific good", zhExplanation: "对每单位特定商品征收的税，会使供给曲线向上移动并产生无谓损失。", pronunciation: "", audioUrl: "", difficulty: "Intermediate", category: "Subject concept", tags: "taxes; policy", misconceptions: "The seller always pays the whole tax || The burden depends on elasticity", apExample: "An excise tax on gasoline raises the price buyers pay and lowers the price sellers keep.", realWorld: "Cigarette taxes discourage smoking.", visual: "supply-demand", imageUrl: "", related: "tax incidence; deadweight loss", confusedWith: "", writtenPrompt: "", priority: "High", source: "Teacher-written", reviewStatus: "Teacher review", status: "draft" },
    { id: "", subject: "AP Biology", unit: 3, unitTitle: "Cellular Energetics", topic: "", topicTitle: "", term: "chemiosmosis", zh: "化学渗透", definition: "ATP synthesis powered by the flow of protons down their gradient through ATP synthase", zhExplanation: "H+ 顺浓度梯度通过 ATP 合酶时驱动 ATP 合成。", pronunciation: "", audioUrl: "", difficulty: 3, category: "", tags: "", misconceptions: "", apExample: "Chemiosmosis in mitochondria depends on the proton gradient built by the electron transport chain.", realWorld: "", visual: "", imageUrl: "", related: "electron transport chain; ATP", confusedWith: "", writtenPrompt: "", priority: "", source: "", reviewStatus: "draft", status: "draft" },
  ];
  const csv = "﻿" + Papa.unparse(rows, { columns: TEMPLATE_COLUMNS });
  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": 'attachment; filename="ap-lexicon-vocabulary-template.csv"' } });
}
