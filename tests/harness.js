/* Node harness for Muse Switch Kit.
   Extracts the pure <script id="agent-core"> block from index.html and
   asserts its behavior. Run: node tests/harness.js
   The kit's honesty law is what is pinned here: conversions are claimed
   only where a rule performed them, capabilities a pasted brief cannot
   carry are named with workarounds, and nothing moves silently. */
"use strict";
var fs = require("fs"), os = require("os"), path = require("path");

var html = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8");
var m = html.match(/<script id="agent-core">([\s\S]*?)<\/script>/);
if (!m) { console.error("agent-core block not found"); process.exit(1); }
var tmp = path.join(fs.mkdtempSync(path.join(os.tmpdir(), "msk-")), "core.js");
fs.writeFileSync(tmp, m[1]);
var C = require(tmp);

var passed = 0, failed = 0, failures = [];
function check(name, cond) {
  if (cond) { passed++; }
  else { failed++; failures.push(name); console.log("FAIL: " + name); }
}
function includes(name, hay, needle) { check(name, typeof hay === "string" && hay.indexOf(needle) >= 0); }
function byId(id) { return C.MATRIX_ACTIONS.filter(function(a){ return a.id === id; })[0]; }
function findItem(items, prefix) {
  for (var i = 0; i < items.length; i++) if (items[i].original.indexOf(prefix) === 0) return items[i];
  return null;
}

var EM = String.fromCharCode(8212); /* the em dash character, built from its code so this file stays free of it */

/* ---------- catalogs and conservative defaults ---------- */
check("K01 PLATFORMS has 5 platforms", Object.keys(C.PLATFORMS).length === 5);
check("K02 buckets in order", C.BUCKETS.map(function(b){ return b.id; }).join(",") === "carried,adapted,noneq");
check("K03 MATRIX_ACTIONS has 7 actions", C.MATRIX_ACTIONS.length === 7);
check("K04 send defaults to always ask first", byId("sendMessages").def === "ask");
check("K05 spend defaults to always ask first", byId("spendMoney").def === "ask");
check("K06 post defaults to always ask first", byId("postPublicly").def === "ask");
check("K07 delete defaults to always ask first", byId("deleteFiles").def === "ask");
check("K08 drafting defaults to runs freely", byId("draftContent").def === "free");
check("K09 platform name resolves", C.platformName("chatgpt") === "ChatGPT" && C.platformName("zzz") === "another platform");

/* ---------- parsing ---------- */
var sampleItems = C.parseItems(C.SAMPLE_SETUP);
check("K10 sample parses to 13 items", sampleItems.length === 13);
check("K11 bullets and numbering are stripped", C.parseItems("- One real line here.\n* Another full line.\n2. A third solid line.").length === 3);
check("K12 bare section headers are dropped", C.parseItems("About me:\nI run two studios in Austin.").length === 1);
check("K13 empty text parses to nothing", C.parseItems("   \n  ").length === 0);

/* ---------- the sample conversion: all three buckets ---------- */
var res = C.classifySetup(C.SAMPLE_SETUP, "chatgpt");
check("K14 sample has carried items", res.counts.carried >= 1);
check("K15 sample has adapted items", res.counts.adapted >= 1);
check("K16 sample has no equivalent items", res.counts.noneq >= 1);
check("K17 bucket counts sum to the total", res.counts.carried + res.counts.adapted + res.counts.noneq === res.counts.total && res.counts.total === res.items.length);
check("K18 every adapted item carries a why", res.items.filter(function(i){ return i.bucket === "adapted"; }).every(function(i){ return i.why && i.why.length > 20; }));
check("K19 every adapted rewrite differs from its original", res.items.filter(function(i){ return i.bucket === "adapted"; }).every(function(i){ return i.rewritten && i.rewritten !== i.original; }));
check("K20 every no equivalent item carries a workaround", res.items.filter(function(i){ return i.bucket === "noneq"; }).every(function(i){ return i.workaround && i.workaround.length > 30; }));

var memItem = findItem(res.items, "Remember that my lead magnet");
check("K21 remembered facts adapt into standing context", !!memItem && memItem.bucket === "adapted" && memItem.ruleId === "memory" && memItem.rewritten.indexOf("Standing context:") === 0);
var actItem = findItem(res.items, "Use the SendOffer action");
check("K22 an action call adapts into the plain task", !!actItem && actItem.bucket === "adapted" && actItem.ruleId === "actions" && actItem.rewritten === "Email the weekly promo to my list every Friday.");
var filesItem = findItem(res.items, "Always check the uploaded files");
check("K23 uploaded files have no equivalent, with a workaround", !!filesItem && filesItem.bucket === "noneq" && filesItem.workaround.indexOf("attach the files") >= 0);
var browseItem = findItem(res.items, "Browse the web every Monday");
check("K24 live browsing has no equivalent", !!browseItem && browseItem.bucket === "noneq" && browseItem.workaround.indexOf("live browsing") >= 0);
var apiItem = findItem(res.items, "Call the booking API");
check("K25 API calls have no equivalent", !!apiItem && apiItem.bucket === "noneq" && apiItem.ruleId === "api");
var persistItem = findItem(res.items, "Remember everything across all our chats");
check("K26 persistent cross-chat memory has no equivalent, it is not adapted", !!persistItem && persistItem.bucket === "noneq" && persistItem.ruleId === "memory");

/* ---------- known vocabulary: adaptations with whys ---------- */
var gptItem = C.classifyItem("You are the assistant inside my custom GPT for client onboarding.");
check("K27 custom GPT phrasing adapts", gptItem.bucket === "adapted" && gptItem.rewritten.indexOf("Muse agent") >= 0 && gptItem.why.length > 0);
var ciItem = C.classifyItem("Always follow my custom instructions about tone.");
check("K28 custom instructions phrasing adapts", ciItem.bucket === "adapted" && ciItem.rewritten.indexOf("instructions in this brief") >= 0 && ciItem.why.length > 0);
check("K29 a plain role line carries over", C.classifyItem("You are a marketing consultant for independent fitness studios.").bucket === "carried");
check("K30 a plain tone rule carries over", C.classifyItem("Always write in short paragraphs and plain English.").bucket === "carried");
check("K31 a do-not rule carries over", C.classifyItem("Never mention competitors by name.").bucket === "carried");
check("K61 the idiom call to action is not a platform action", C.classifyItem("Format social posts as a hook line, three short lines, then a call to action.").bucket === "carried");

/* ---------- moving items between buckets changes the brief ---------- */
var browseIdx = res.items.indexOf(browseItem);
var overrides = {}; overrides[browseIdx] = "carried";
var moved = C.classifySetup(C.SAMPLE_SETUP, "chatgpt", overrides);
check("K32 the user's move wins over the rules", moved.items[browseIdx].bucket === "carried" && moved.counts.noneq === res.counts.noneq - 1);
var BASE_CFG = {
  platform: "chatgpt", sourceText: C.SAMPLE_SETUP, useCase: C.SAMPLE_USE_CASE,
  userName: "Dana Ortiz", agentName: "Scout", identity: "",
  bearings: ["calm"], values: ["accuracy"], valuesText: "My regulars get remembered by name",
  neverDo: ["noinvent"], neverDoText: "Never quote a price that is not on the current rate card.",
  voiceSample: "Scout here, Dana. Your week in marketing, handled: promos drafted, posts queued, nothing sent without your yes.",
  matrix: {}
};
var movedBrief = C.buildBrief(Object.assign({}, BASE_CFG, { items: moved.items }));
includes("K33 a moved item lands in the brief", movedBrief, "Browse the web every Monday");
check("K34 a moved item leaves the not carried over note", C.buildNotCarriedNote(moved.items).indexOf("Browse the web") < 0);
check("K35 an unmoved item stays in the note", C.buildNotCarriedNote(res.items).indexOf("Browse the web") >= 0);

/* ---------- the brief: three sections, soul, honesty ---------- */
var brief = C.buildBrief(BASE_CFG);
var i1 = brief.indexOf("SECTION 1: WHO YOUR AGENT IS"), i2 = brief.indexOf("SECTION 2: WHAT YOUR AGENT DOES"), i3 = brief.indexOf("SECTION 3: WHERE YOU STAY IN CHARGE");
check("K36 three section headers appear in order", i1 >= 0 && i2 > i1 && i3 > i2);
includes("K37 brief carries the framing line", brief, "Bring everything you built. It deserves a better home.");
includes("K38 brief names the agent", brief, "Name: Scout");
includes("K39 free-text never-do lands verbatim", brief, "Never quote a price that is not on the current rate card.");
includes("K40 preset never-do reaches the brief", brief, "Never invent facts or figures");
includes("K41 free-text value lands verbatim", brief, "My regulars get remembered by name");
includes("K42 the edited voice sample ships, word for word", brief, "Scout here, Dana. Your week in marketing, handled");
check("K43 a blank sample falls back to the generated line", brief.indexOf(C.buildVoiceSample(BASE_CFG)) < 0 && C.buildBrief(Object.assign({}, BASE_CFG, { voiceSample: "" })).indexOf(C.buildVoiceSample(BASE_CFG)) >= 0);
includes("K44 a carried line moves word for word", brief, "Never mention competitors by name.");
includes("K45 memory adaptations become standing context", brief, "Standing context (facts this agent holds in every conversation):");
includes("K46 standing context carries the fact", brief, "My lead magnet is a free first-week pass");
includes("K47 adapted action lands as the plain task", brief, "Email the weekly promo to my list every Friday.");
includes("K48 not carried over note is in the output", brief, "NOT CARRIED OVER");
includes("K49 the note lists what did not move", brief, "Always check the uploaded files before answering pricing questions.");
includes("K50 the note prints the workaround", brief, "Workaround:");
includes("K51 conservative defaults print as rules", brief, "- Send messages or email: Always ask first");
includes("K52 honest handoff line is present", brief, "no Muse login or provisioning API yet");

/* ---------- gates and name/identity fallbacks ---------- */
check("K53 empty input cannot produce a brief", C.buildBrief({ sourceText: "   \n " }) === "" && C.buildBrief({ sourceText: "" }) === "");
includes("K54 the gate says so plainly", C.buildGate({}).message, "Nothing to convert yet");
check("K55 a blank name falls back to a non-empty suggestion", C.resolveAgentName({ agentName: "  " }) === "Nova" && C.resolveAgentName({}).length > 0);
check("K56 a given name always wins", C.resolveAgentName({ agentName: "Scout" }) === "Scout");
includes("K57 default identity has the guided shape", C.defaultIdentity({ platform: "chatgpt", agentName: "" }), "You are Nova, my Muse agent, brought over from my ChatGPT setup");
check("K58 an edited identity wins over the default", C.resolveIdentity({ identity: "You are Scout, my marketing chief.", platform: "chatgpt" }) === "You are Scout, my marketing chief.");

/* ---------- no em dashes anywhere in generated output ---------- */
check("K59 brief has zero em dashes", brief.indexOf(EM) < 0 && movedBrief.indexOf(EM) < 0);
check("K60 conversion output has zero em dashes", res.items.every(function(i){ return (i.rewritten + i.why + i.workaround).indexOf(EM) < 0; }) && C.buildNotCarriedNote(res.items).indexOf(EM) < 0);

console.log("TOTAL: " + (passed + failed) + " assertions, " + passed + " passed, " + failed + " failed");
if (failures.length) { console.log("Failures: " + failures.join("; ")); }
process.exit(failed ? 1 : 0);
