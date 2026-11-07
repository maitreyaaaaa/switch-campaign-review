# STE100 sentence-length check

The reviewer includes a deterministic check for a narrow part of ASD-STE100 Issue 9: sentence length. For descriptive launch copy, the check uses a 25-word maximum per sentence. For procedural text, it uses a 20-word maximum. It reports the percentage of sentences within the selected limit and whether at least 80% pass.

This supports an “80% of sentences pass this length check” goal. It does **not** mean the text is 80% compliant with ASD-STE100. The tool does not use or validate the full controlled dictionary, part-of-speech rules, grammar rules, one-topic rule, or meaning. A language model and a human must still protect the evidence-backed meaning and audience when they revise copy.

## Fictional campaign example

Compound claims from the Switch rehearsal:

> CSV export is available to every account and takes seconds to set up. Internal testers in the US can use CSV export today, and it reduces manual errors by 80%.

The fictional fixture contradicts access for every account, supports access for US internal testers today, and has no evidence for setup time or the 80% error-reduction claim. The reviewer must mark the unsupported clauses `Unknown`. Its supported shorter suggestion is:

> Internal testers in the US can use CSV export today.

That 10-word descriptive sentence passed the project's 25-word sentence-length limit (100%; project target 80%). The suggestion remains subject to the evidence review and human choice. The style check cannot make an unsupported promise safe. This result is a sentence-length subset only, not full ASD-STE100 compliance.

## Real-world connection

For a SaaS launch, connect the reviewer to an authenticated, read-only release service. The service should return the feature, release state, eligible plans and audiences, region, source record, owner, and observation time. First match each launch claim to this evidence. Then use the sentence-length check to make a supported suggestion easier to scan. Product or marketing staff still choose what to do in chat. Do not connect a publishing tool until a separate approval and audit flow exists.

The official ASD-STE100 site describes the standard as writing rules plus a controlled dictionary. See [ASD-STE100 About](https://www.asd-ste100.org/about.html) and the [Issue 9 specification](https://www.asd-ste100.org/assets/files/ASD-STE100_ISSUE9.pdf).
