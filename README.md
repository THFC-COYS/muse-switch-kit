# Muse Switch Kit

**Bring everything you built. It deserves a better home.**

People spend months teaching an AI platform how they work: custom instructions, a system prompt, a custom GPT configuration, saved prompts, hard won tone rules. Then they consider switching, and the switching cost feels like starting over. Muse Switch Kit removes that cost honestly. Paste the setup you already have, read a conversion report that says plainly what carries over, what was rewritten and why, and what no pasted brief can carry, then add the soul most setups never had, and leave with one clean Muse agent brief: who your agent is, what it does, and where you stay in charge.

The kit is pro-Muse without trashing where anyone started. ChatGPT, Claude, Gemini, and Copilot setups are treated as real work worth keeping, because they are. The frame is a move, not a breakup.

Built by Greg Lucas, a Muse early adopter and advocate. Sibling studios: [Owner Agent Studio](https://owner-agent-studio.vercel.app) (design a governed personal agent from scratch) and [CourseAgent Studio](https://courseagent-studio.vercel.app) (the same pattern for faculty). Same design law across the portfolio: Muse first, governance first, honesty in writing.

## Who it is for

Anyone with an existing AI setup on another platform who wants to move to Muse without losing the work: consultants and freelancers with tuned custom GPTs, operators with long custom instructions, teams whose prompts live in a shared doc, and anyone whose assistant knows their business but has no identity, no values, and no approval boundaries. The switch is also the upgrade: most source setups are instructions only, and the kit's third step adds the soul they were missing.

## The four steps

No build step, no dependencies, no server. One file: open `index.html` in any modern browser, or serve the folder with any static host. Nothing you paste is sent anywhere; the kit runs entirely in your browser and autosaves to localStorage on your device only.

**Step 1: Bring your setup.** Pick the source platform (ChatGPT, Claude, Gemini, Copilot, or other, because formats and vocabulary differ) and paste whatever you have: custom instructions, a system prompt, an agent configuration, saved prompts, or plain notes. One optional line asks what you mainly use your assistant for. A "Try with a sample setup" button loads a realistic ChatGPT custom instructions text (a fictional marketing consultant for two fitness studios) that exercises every bucket in one click. An empty paste cannot proceed, and the kit says so plainly.

**Step 2: Map it.** The kit splits your paste into items and sorts each one with transparent, rule based heuristics:

- **Carried over:** instructions that work as-is in a Muse brief: role and task instructions, tone and style rules, formatting preferences, do and do-not rules. These move word for word.
- **Adapted:** lines rewritten into Muse brief terms by an explicit mapping table in the core (a custom GPT becomes a Muse agent brief, platform memory phrasing becomes standing context written into the brief, actions and plugins phrasing becomes a described workflow step the agent performs in conversation, custom instructions become brief instructions). Every adapted item shows the original line, the rewritten line, and a one line why.
- **No equivalent yet:** lines referencing capabilities a pasted brief cannot carry: uploaded knowledge files, live browsing toggles, API actions, persistent cross-chat memory, and similar. Each gets the closest Muse-native workaround in one line (paste the key document text into the brief's standing context, attach the file in the Muse conversation, and so on).

The step is labeled honestly: a smart first pass based on rules, not magic. Every item carries a control to move it between buckets, the report shows counts per bucket, and your sorting wins over the rules everywhere downstream, including the brief.

**Step 3: Add the soul.** Most source setups have instructions but no soul. Here the agent gets one, mirroring the Owner Agent Studio pattern: a name (the kit suggests one if you leave it blank; the brief never ships nameless), a guided identity statement you can edit freely, character bearing chips, values chips plus your own values in your own words, never-do rules as preset chips plus free text rules that land in the brief verbatim, an auto generated voice sample line you approve or edit (the text you leave in the box is the text that ships), and an approval matrix for a general assistant (draft, research, send, schedule, spend, post, delete) with conservative defaults: anything that sends, spends, posts, or deletes starts at Always ask first.

**Step 4: Leave with the brief.** One clean, copy ready brief in three headed sections: Section 1, Who your agent is (the soul); Section 2, What your agent does (the job converted from your setup, with memory adaptations organized as standing context); Section 3, Where you stay in charge (the approval matrix as plain rules). Items in the No equivalent bucket do not silently vanish: they print after the brief in a Not carried over note with their workarounds. A Copy button, a Download button, and the standing honest line complete the step: copy and paste is the bridge today; there is no Muse login or provisioning API yet, so nothing is transferred automatically.

## The honesty rules of the conversion report

- A rewrite is claimed only where a rule in the mapping table actually rewrote the line. If no rule fires, the line carries over or is named as having no equivalent; it is never dressed up as a translation.
- No Muse feature is invented, ever. Where a capability cannot travel in a pasted brief, the report says so and offers the closest workaround a brief can honestly support.
- Nothing is silently dropped. Every pasted item appears in the report, and every item that did not move appears again in the Not carried over note with its workaround.
- The heuristics are visible in the source (`ADAPTATIONS` and `NOEQ_RULES` in the core) and the user can override any single sorting decision.
- The sample setup is fictional and labeled as such, and it deliberately contains lines for all three buckets so the report's behavior can be judged before anyone pastes real work.

## The honest part

The conversion is a first pass, not a guarantee. Rule based sorting will misread an unusual line now and then, which is exactly why every item can be moved and why the report says "rules, not magic" in the interface. Reviewing the report is part of the switch, and it takes about a minute.

The core logic lives in one script block in `index.html` (`id="agent-core"`), written as pure functions with no DOM access, so it can be lifted out and unit tested in Node. The parser, the classification of the full sample into all three buckets, the mapping table adaptations and their whys, the workarounds, bucket moves changing the brief, the three section output with verbatim never-do rules and the user edited voice line, the conservative approval defaults, the empty input gate, and the zero em dash rule for generated output are all covered: run `node tests/harness.js` (61 assertions).

## Files

| File | What it is |
| --- | --- |
| `index.html` | The whole kit: interface, conversion report, soul step, and brief builder |
| `tests/harness.js` | Node assertions against the `agent-core` block |
| `README.md` | This file |

## Author

Greg Lucas, Founder of pAIgeBreaker (personalized learning, with Aithentik authorship verification) and AIccountable (agent adoption and governance for business). Faculty Chair at Grand Canyon University, where he authored AI degree programs and responsible-AI guidelines; Team Lead at Southern New Hampshire University. He writes and speaks on safe agentic AI and builds in public on Muse.

- Portfolio: [paigebreaker.com](https://paigebreaker.com)
- LinkedIn: [linkedin.com/in/greg-lucas-28765b416](https://www.linkedin.com/in/greg-lucas-28765b416/)
- Muse Exchange: [muse-exchange.vercel.app](https://muse-exchange.vercel.app)
- MuSe SIM: [muse-sim.vercel.app](https://muse-sim.vercel.app)
