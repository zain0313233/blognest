import 'dotenv/config'
import pg from 'pg'
import bcrypt from 'bcryptjs'

const { Pool } = pg
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

function cuid() {
  return 'c' + Math.random().toString(36).slice(2, 11) + Date.now().toString(36)
}

const AUTHORS = [
  { name: 'Sarah Mitchell', email: 'sarah@blognest.com', password: 'Sarah@12345', role: 'user' },
  { name: 'James Okafor', email: 'james@blognest.com', password: 'James@12345', role: 'user' },
  { name: 'Priya Sharma', email: 'priya@blognest.com', password: 'Priya@12345', role: 'user' },
  { name: 'Lucas Fernandez', email: 'lucas@blognest.com', password: 'Lucas@12345', role: 'user' },
  { name: 'Admin', email: 'admin@blognest.com', password: 'Admin@123456', role: 'admin' },
]

const POSTS = [
  // Technology
  {
    title: 'The AGI Moment: How Artificial General Intelligence Transformed Everything in 2026',
    category: 'Technology',
    tags: ['AI', 'AGI', 'Machine Learning', 'Future'],
    coverImage: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=800&q=80&auto=format&fit=crop',
    excerpt: 'For decades, the question was not "if" but "when." In 2026, we finally have the answer — and the world has not been the same since.',
    body: `For decades, artificial intelligence researchers argued over when — not if — machines would surpass human-level cognition. In early 2026, that moment arrived with startling speed, reshaping industries, governments, and daily life in ways that even the most optimistic forecasters hadn't anticipated.

The milestone, dubbed "AGI Day" by the press, occurred in February when three separate research labs — OpenAI, Google DeepMind, and a Chinese consortium — independently verified that their systems could perform any cognitive task a human could, often with superior speed and accuracy. Unlike previous AI achievements that dominated narrow domains, these systems demonstrated genuine cross-domain reasoning, emotional intelligence calibration, and long-term planning.

The economic fallout was immediate. Stock markets surged nearly 18% in the week following the announcements, with semiconductor companies, cloud providers, and automation startups leading the rally. But the jubilation masked a deeper anxiety: if machines could now think, what exactly was left for humans to do?

Governments scrambled to respond. The United Nations convened an emergency session on AI governance, producing what became known as the Geneva Framework on Artificial Cognition — a set of non-binding principles for the "responsible deployment of post-AGI systems." Critics noted that non-binding was doing a lot of heavy lifting in that sentence.

Yet everyday life changed in ways both profound and mundane. Medical diagnosis accuracy improved by 34% globally within six months of widespread AGI deployment. Legal aid became accessible to millions who previously couldn't afford attorneys. Climate modeling reached new levels of precision, giving policymakers tools they'd never had. Education became genuinely personalized — not just adaptive, but truly responsive to each student's unique learning patterns.

The question now is not whether AGI has arrived, but whether humanity has the wisdom to use it well. History suggests we won't always get that right. But for the first time, we also have a partner in trying.`,
    authorEmail: 'sarah@blognest.com',
    publishedDate: new Date('2026-02-15'),
  },
  {
    title: 'Quantum Computing Breaks RSA Encryption: The Cybersecurity Crisis of 2026',
    category: 'Technology',
    tags: ['Quantum Computing', 'Cybersecurity', 'Encryption', 'Tech'],
    coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80&auto=format&fit=crop',
    excerpt: 'When IBM announced its 10,000-qubit processor last March, the global cybersecurity community held its breath. Last month, that breath finally ran out.',
    body: `When IBM announced its 10,000-qubit processor last March, the global cybersecurity community held its breath. Last month, that breath finally ran out.

A team of researchers at MIT, working in collaboration with IBM's quantum division, demonstrated the first practical break of RSA-2048 encryption — the standard protecting everything from your bank account to nuclear missile launch codes. The attack took 11 hours using a hybrid classical-quantum algorithm, a timeline that would have seemed like science fiction just 18 months ago.

The implications are staggering. RSA encryption underpins the security architecture of the modern internet. Email, financial transactions, government communications, medical records — essentially every piece of sensitive data transmitted online has relied on the mathematical difficulty of factoring large prime numbers. Quantum computers, exploiting superposition and entanglement, can perform this factoring exponentially faster than any classical machine.

Governments were already nervous. The US National Security Agency had been quietly transitioning federal systems to post-quantum cryptography standards since 2024, but the timeline assumed they had until at least 2030. They were wrong.

The fallout has been swift. Major banks began emergency migrations to NIST-approved post-quantum algorithms. Several cryptocurrency exchanges suspended operations temporarily as they audited their cryptographic infrastructure. Even encrypted messaging apps like Signal rushed out quantum-resistant updates.

"Harvest now, decrypt later" attacks — where adversaries had been capturing encrypted data for years, waiting for quantum decryption to become viable — now loom as a genuine threat to decades of archived communications. Intelligence services around the world are scrambling to assess what was collected.

The silver lining, if there is one: the crisis arrived somewhat predictably. The field had been warning about Q-Day for years. The challenge now is executing the transition quickly enough, and equitably enough, that not just the wealthy and well-resourced emerge secure on the other side.`,
    authorEmail: 'james@blognest.com',
    publishedDate: new Date('2026-03-08'),
  },
  {
    title: 'Neural Interfaces Go Consumer: Inside Neuralink\'s Public Launch',
    category: 'Technology',
    tags: ['Neuralink', 'Brain-Computer Interface', 'Health Tech', 'Elon Musk'],
    coverImage: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=800&q=80&auto=format&fit=crop',
    excerpt: 'After years of clinical trials and regulatory battles, brain-computer interfaces are finally available to the general public. What that actually means is complicated.',
    body: `After years of clinical trials and regulatory battles, brain-computer interfaces are finally available to the general public. What that actually means is complicated — and the early reviews are more nuanced than either the utopians or the dystopians predicted.

Neuralink's N2 device, cleared by the FDA last January after two years of post-approval monitoring of its initial trial cohort, went on sale in April for $8,400 — a price point that immediately drew criticism for its exclusivity. The procedure involves a one-hour outpatient surgery under local anesthesia, with full recovery in three to five days.

The device's capabilities are genuinely impressive. Users can control smartphones, computers, and smart home systems with thought alone — with latency low enough that it feels instantaneous after a brief calibration period. For the 2.6 million Americans with severe paralysis or motor neuron disease, the therapeutic applications are transformative. One 34-year-old ALS patient who received an early device told reporters she had "gotten her voice back" after years of total locked-in syndrome.

But the consumer rollout has surfaced ethical concerns that the therapeutic focus had somewhat obscured. Who owns the neural data generated by the device? Neuralink's terms of service grant the company broad data rights, drawing sharp criticism from privacy advocates. Could this data be sold to advertisers? Subpoenaed by law enforcement? Hacked? The company's answers have been less reassuring than the questions demand.

More philosophically uncomfortable is the inequality question. If neural enhancement becomes mainstream — not just therapeutic but cognitively augmenting — what happens to those who can't afford or don't want implants? Will employers implicitly require them? Will educational institutions calibrate expectations upward?

For now, most N2 users are using the device for accessibility and productivity rather than enhancement. But the hardware is capable of much more. Future software updates will unlock additional features. The question of what those features will be, and who will control them, may be the defining regulatory debate of the next decade.`,
    authorEmail: 'priya@blognest.com',
    publishedDate: new Date('2026-04-22'),
  },
  {
    title: 'The Death of Traditional Search: How AI Assistants Ended Google\'s 25-Year Reign',
    category: 'Technology',
    tags: ['Google', 'AI Search', 'Big Tech', 'Internet'],
    coverImage: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&q=80&auto=format&fit=crop',
    excerpt: 'Google\'s search market share dropped below 50% for the first time in its history this quarter. The company that defined how we find information is fighting for survival.',
    body: `Google's search market share dropped below 50% for the first time in its history this quarter. The company that defined how we find information is fighting for survival in a landscape it helped create but failed to dominate.

The shift has been years in the making, accelerated by the arrival of AGI-level conversational AI. When OpenAI launched its SearchGPT integration in late 2024, analysts dismissed it as a novelty. When Apple replaced Safari's default search engine with its own AI-powered Spotlight Search last year, the industry began to pay attention. When Samsung, the world's largest Android manufacturer, embedded a native AI search experience in its 2026 Galaxy lineup, Google's position became genuinely precarious.

The fundamental problem is that search, as Google invented it, was designed for a pre-AI world. Its model — index everything, rank by relevance, display ads — made sense when information retrieval was the challenge. In 2026, retrieval is trivially solved. The hard problem is synthesis, judgment, and conversation. And that's where Google has found itself playing catch-up.

The company's own AI search product, called Gemini Search, launched in 2025 to mixed reviews. Critics noted it was too conservative, too hedged, and too ad-laden to compete with the fluency of newer rivals. Internal documents leaked to the press in March revealed that Gemini Search had actually cannibalised Google's traditional search volume by more than 30% without generating equivalent ad revenue — a financial nightmare disguised as a product.

Google's advertising business, which generated $175 billion in 2024, is now under serious pressure. Advertisers are finding AI-powered platforms more efficient and less dependent on keyword matching. The old model of paying for clicks to blue links feels increasingly anachronistic.

The company is not going quietly. Its DeepMind division has been racing to deploy more powerful AI capabilities, and its cloud business remains a dominant force. But the era of Google's unchallenged internet dominance is over. The next decade will reveal whether it can reinvent itself — again.`,
    authorEmail: 'lucas@blognest.com',
    publishedDate: new Date('2026-05-03'),
  },
  // Politics
  {
    title: 'The UN\'s AI Governance Treaty: Landmark Agreement or Diplomatic Theater?',
    category: 'Politics',
    tags: ['United Nations', 'AI Governance', 'Geopolitics', 'Policy'],
    coverImage: 'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?w=800&q=80&auto=format&fit=crop',
    excerpt: 'After 18 months of tortured negotiations, 142 nations signed the Geneva Framework on Artificial Cognition. The question is whether it means anything at all.',
    body: `After 18 months of tortured negotiations, 142 nations signed the Geneva Framework on Artificial Cognition in March 2026. The question — asked immediately and persistently by critics across the political spectrum — is whether it means anything at all.

The Framework commits signatories to "responsible development and deployment" of advanced AI systems, establishes a new UN oversight body called the International AI Safety Council (IASC), and creates a hotline mechanism for nations to report potential AI-related security incidents. What it notably does not do is set binding limits on AI capabilities, mandate transparency about training data, or establish any enforcement mechanism beyond diplomatic pressure.

The United States and European Union pushed hard for stronger provisions. China and Russia — whose AI programs are among the world's most advanced — resisted anything that would constrain development pace or require disclosure of proprietary architectures. The final text represents the lowest common denominator of consensus, which in international agreements is often another way of saying very little.

"We've created a structure for conversations," admitted EU Digital Commissioner Katja Müller at the signing ceremony in Geneva, choosing her words with the careful precision of someone who knows she's describing a disappointment. "That structure will need to evolve."

The most significant concrete outcome may be the IASC itself. Modeled loosely on the International Atomic Energy Agency, it will have a secretariat, a monitoring mandate, and the ability to conduct voluntary inspections of major AI facilities. The emphasis on "voluntary" drew scathing commentary from arms control experts who noted that the IAEA without mandatory inspection authority would have been largely useless during the Cold War's nuclear proliferation era.

Still, proponents argue that even imperfect international frameworks matter. The Nuclear Non-Proliferation Treaty was widely criticized as toothless when it launched in 1968; today it is credited with preventing nuclear proliferation in dozens of countries that had the technical capability to go nuclear. Whether AI governance follows a similar trajectory depends on whether the major powers find sufficient common interest in cooperation — and whether they decide to build that interest before, or after, something goes catastrophically wrong.`,
    authorEmail: 'sarah@blognest.com',
    publishedDate: new Date('2026-03-20'),
  },
  {
    title: 'NATO\'s New Eastern Frontier: How the Alliance Transformed in Five Years',
    category: 'Politics',
    tags: ['NATO', 'Europe', 'Security', 'Geopolitics'],
    coverImage: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&q=80&auto=format&fit=crop',
    excerpt: 'With Ukraine as a full member and four new eastern members joining in 2025, NATO has fundamentally changed its character and its risk profile.',
    body: `With Ukraine as a full NATO member and four new countries joining the alliance in 2025 alone, the organization that Winston Churchill might recognize from 1949 has become something altogether new — more expansive, more committed, and arguably more exposed.

Ukraine's accession, finalized in September 2025 after two years of intense diplomacy, was the capstone of a strategic realignment that began with the 2022 invasion. The membership came with sobering fine print: Article 5 collective defense obligations now extend to a country actively engaged in territorial dispute with a nuclear-armed adversary. Alliance strategists spent considerable energy developing doctrines for managing this novel situation.

The practical military transformation has been substantial. Defense spending among European NATO members averaged 2.8% of GDP in 2025, up from 1.7% in 2021. Germany reversed its post-Cold War demilitarization more thoroughly than any observer predicted, commissioning its largest military expansion since reunification. Poland now fields the largest conventional army in Europe west of Russia.

The eastern members — Latvia, Lithuania, Estonia, and Poland — have become NATO's most vocal advocates for what they call "persistent presence": large, permanent allied force rotations on their territory rather than the rotating battle groups of previous years. Their argument, born of geographic proximity and historical memory, has largely won the day.

But NATO's expansion has also created new tensions within the alliance. Hungary's continued flirtation with Moscow has become a genuine internal security problem. Turkey's evolving relationship with Russia's energy sector complicates alliance solidarity on sanctions. And the United States, still providing the backbone of collective defense, faces domestic political pressures to demand more from European allies — pressures that won't disappear with any single election.

The alliance that spent the post-Cold War years searching for a purpose has found one. Whether it's the right purpose, and whether the internal contradictions can be managed, are questions that will define the next decade of European security.`,
    authorEmail: 'james@blognest.com',
    publishedDate: new Date('2026-01-18'),
  },
  {
    title: 'Global Populism\'s Third Wave: What\'s Driving the New Discontent?',
    category: 'Politics',
    tags: ['Populism', 'Democracy', 'Global Politics', 'Society'],
    coverImage: 'https://images.unsplash.com/photo-1541872705-1f73c6400ec9?w=800&q=80&auto=format&fit=crop',
    excerpt: 'Economists predicted that prosperity would dampen populist fires. They were wrong. The third wave of anti-establishment politics is driven by something money can\'t buy.',
    body: `Economists predicted that prosperity would dampen populist fires. They were broadly wrong. A third wave of anti-establishment politics is now cresting across democracies worldwide, and its fuel is different from the economic grievances that powered its predecessors.

The first wave, which peaked around 2016-2020, was driven primarily by economic dislocation — deindustrialization, wage stagnation, and the visible failures of globalization to distribute its gains equitably. The second wave, roughly 2021-2024, mixed economic anxiety with cultural backlash and pandemic-era distrust of institutions.

The current wave is something more philosophically unsettling: it is driven by a crisis of meaning and belonging that material improvement doesn't address. Unemployment in most Western democracies is at historic lows. Real wages have recovered in most major economies. And yet poll after poll shows deep dissatisfaction with "the system" — a system that people feel is competent enough to keep them employed but incapable of giving their lives dignity or purpose.

The role of AI in this dynamic is significant and underappreciated. Automation has generated wealth at the macro level while eroding at the micro level the sense of craftsmanship, expertise, and irreplaceability that made work meaningful for many people. When a doctor can be outperformed by an algorithm, when a lawyer's analysis can be replicated in seconds, when a graphic designer's livelihood is threatened by image generation models — the question isn't just whether you have a job. It's whether your skills, judgment, and experience matter.

Social media's role has evolved too. The platforms have gotten better at moderating explicit extremism. They've gotten worse at addressing the subtler radicalization that comes from an infinite feed of outrage, grievance, and tribal affirmation that feels personalized because it is.

The parties and politicians exploiting this wave are diverse in ideology but united in rhetoric: the elites don't understand you, the system is rigged, and I alone see it clearly. That formula has proven devastatingly effective regardless of whether it comes from the left, the right, or something harder to classify. Understanding why it works is the central political challenge of our era.`,
    authorEmail: 'priya@blognest.com',
    publishedDate: new Date('2026-04-07'),
  },
  // Science & Space
  {
    title: 'Artemis IV: Humanity Returns to the Moon After 54 Years',
    category: 'Science',
    tags: ['NASA', 'Moon', 'Space Exploration', 'Artemis'],
    coverImage: 'https://images.unsplash.com/photo-1446776877081-d282a0f896e2?w=800&q=80&auto=format&fit=crop',
    excerpt: 'On March 3rd, 2026, Commander Elena Vasquez became the first human to set foot on the lunar surface since Eugene Cernan in December 1972. The difference, 54 years later, is everything.',
    body: `On March 3rd, 2026, Commander Elena Vasquez became the first human to set foot on the lunar surface since Eugene Cernan in December 1972. The difference, 54 years later, is everything.

Vasquez and Mission Specialist Dr. Kwame Asante touched down at the lunar south pole's Shackleton Crater rim — a location chosen for its permanently shadowed ice deposits and near-constant solar illumination. Unlike the Apollo missions' brief surface excursions, Artemis IV was designed for a ten-day surface stay. The two astronauts deployed a semi-permanent habitat module, drilled for water ice samples at depths previous missions couldn't reach, and conducted geological surveys that have already prompted a re-evaluation of the Moon's volcanic history.

The mission's symbolic resonance was unmistakable. Vasquez, the daughter of Mexican immigrants who grew up in New Mexico, became the first Latina and the first woman to walk on the Moon. The broadcast, watched by an estimated 1.2 billion people worldwide, captured something that recent American space achievements had somewhat lacked: genuine emotion. The moment Vasquez stepped onto the regolith and said, simply, "We're back," the Mission Control room in Houston erupted in tears.

But the mission was about much more than the historic image. The Artemis program, now in its operational phase, is building toward permanent habitation. The Gateway lunar space station, its construction nearly complete, will serve as a staging point for regular surface missions beginning in 2027. NASA and its international partners — including the ESA, JAXA, the Canadian Space Agency, and a consortium of Gulf state investors — plan to have a crew of four living at the south pole by 2029.

The geopolitical dimension is impossible to ignore. China's Chang'e 8 mission is targeting the same south pole region for its own crewed landing, planned for late 2027. The water ice deposits are not just scientifically valuable — they are a potential rocket propellant source that could define the economics of a future cislunar economy. We went back to the Moon. The question now is who its resources will belong to.`,
    authorEmail: 'lucas@blognest.com',
    publishedDate: new Date('2026-03-10'),
  },
  {
    title: 'James Webb Discovers Potential Biosignatures on Kepler-452b: What We Know',
    category: 'Science',
    tags: ['James Webb Telescope', 'Exoplanets', 'Astrobiology', 'Space'],
    coverImage: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?w=800&q=80&auto=format&fit=crop',
    excerpt: 'The James Webb Space Telescope has detected methane and oxygen simultaneously in the atmosphere of Kepler-452b. On Earth, this combination only exists because of life.',
    body: `The James Webb Space Telescope has detected methane and oxygen simultaneously in the atmosphere of Kepler-452b. On Earth, this combination only exists because life continuously replenishes both gases against the chemical reactions that would otherwise destroy them. The announcement has ignited a scientific debate unlike anything since the discovery of exoplanets themselves.

Kepler-452b, discovered in 2015, occupies a sweet spot: a rocky world approximately 1.6 times Earth's diameter, orbiting a Sun-like star in the habitable zone, at a distance of 1,400 light-years. It was always a candidate for life. The Webb data, compiled over 14 months of spectroscopic observations, has elevated it from candidate to something more compelling and more unsettling.

The caveat that every scientist is carefully inserting into every statement is geological: some non-biological processes can produce both methane and oxygen under specific conditions. Volcanic outgassing combined with photolysis of water can theoretically generate the observed signatures. The Webb team spent six months rigorously examining this alternative before publishing.

Their conclusion is measured but momentous: "The atmospheric composition is more consistent with biological production than known abiotic processes. We cannot rule out life, and for the first time, we cannot rule it in based on purely physical models."

Confirmation — if it ever comes — faces a fundamental limitation: the light we're observing left Kepler-452b 1,400 years ago. Any civilization that produced those biosignatures experienced whatever happened in the intervening millennia in complete isolation from us. Even our most powerful signal could not reach them for 1,400 more years, and any response a further 1,400 after that.

What we're left with is a question that may define the philosophical character of the coming century: are we almost certainly not alone, or is that methane-oxygen haze the product of a world that found its own strange, abiotic chemistry? The Webb telescope will keep watching. The answer, when it comes, will change everything.`,
    authorEmail: 'sarah@blognest.com',
    publishedDate: new Date('2026-02-28'),
  },
  {
    title: 'CRISPR 3.0 Successfully Cures Sickle Cell Disease in 50,000 Patients',
    category: 'Science',
    tags: ['CRISPR', 'Gene Editing', 'Medicine', 'Biotechnology'],
    coverImage: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80&auto=format&fit=crop',
    excerpt: 'The third generation of CRISPR gene editing has achieved what its inventors dared not promise: a functional cure for sickle cell disease at a scale that makes it accessible globally.',
    body: `The third generation of CRISPR gene editing has achieved what its inventors dared not promise: a functional cure for sickle cell disease at a scale and cost point that makes it accessible not just to wealthy patients in wealthy countries, but to the 300,000 children born with the condition every year, 80% of whom live in sub-Saharan Africa.

CRISPR 3.0, developed by a consortium of academic labs and the startup EditaRx, overcomes the key limitations of earlier gene editing approaches. Previous CRISPR therapies required extracting a patient's cells, editing them in a laboratory, and reinfusing them — a process that cost over $2 million per patient and required sophisticated medical infrastructure. The new approach delivers editing machinery directly into the body via engineered lipid nanoparticles, reducing treatment cost to approximately $15,000 and procedure complexity to something manageable in well-equipped regional hospitals.

The results from the Phase III global trial — conducted across 23 countries — are striking. Among 50,000 patients who received treatment 18 months ago, 94.7% show complete normalization of hemoglobin, with no recurrence of sickle cell crises. The side effect profile is favorable: mild flu-like symptoms for three to five days post-treatment, with no serious adverse events in 97% of participants.

The implications extend far beyond sickle cell disease. The same lipid nanoparticle delivery system is now being tested for beta-thalassemia, certain forms of hereditary blindness, and familial hypercholesterolemia. Preliminary data from animal models for Huntington's disease and Duchenne muscular dystrophy are described by researchers as "exceptionally promising."

The ethical questions that swirled around early gene editing haven't disappeared. The ability to make heritable changes to human embryos — still not pursued in the clinical trials — remains deeply controversial. But the therapeutic potential being realized in living patients has shifted the center of gravity in the bioethics debate toward cautious optimism. We are learning to rewrite the biological code of human suffering, one letter at a time.`,
    authorEmail: 'james@blognest.com',
    publishedDate: new Date('2026-04-15'),
  },
  // Climate
  {
    title: 'COP31 Breakthrough: 180 Nations Commit to Binding 2032 Net-Zero Targets',
    category: 'Climate',
    tags: ['COP31', 'Climate Change', 'Net Zero', 'Environment'],
    coverImage: 'https://images.unsplash.com/photo-1569163139599-0f4517e36f51?w=800&q=80&auto=format&fit=crop',
    excerpt: 'After a decade of voluntary pledges and missed targets, COP31 in Nairobi produced something different: legally binding commitments with real enforcement mechanisms.',
    body: `After a decade of voluntary pledges and missed targets, COP31 in Nairobi produced something qualitatively different from its predecessors: legally binding commitments with real enforcement mechanisms, unanimous support from major emitters including China, India, and the United States, and a loss-and-damage fund that developing nations have actually endorsed rather than reluctantly accepted.

The Nairobi Accord, as it is being called, commits 180 signatory nations to net-zero greenhouse gas emissions by 2032 — eight years earlier than the Paris Agreement's aspirational target. More importantly, it establishes a $2.4 trillion annual fund for climate transition financing, funded primarily by a 0.25% levy on financial transactions among participating economies, and it creates a binding arbitration mechanism for disputes over emissions reporting.

The breakthrough came, according to negotiators who spoke on condition of anonymity, from an unexpected quarter: the insurance industry. As climate-related damages have exceeded $1.2 trillion annually for three consecutive years, reinsurance companies have begun threatening to exit markets in high-risk regions entirely unless governments take credible action. The financial sector's lobbying for serious climate policy — a reversal from two decades of obstruction — proved decisive with holdout governments.

The scientific context for the urgency is stark. The planet has now experienced 18 consecutive months above 1.8°C of warming relative to pre-industrial baseline. The Amazon tipping point, long discussed in theoretical terms, appears to have been crossed: the eastern Amazon is now a net carbon emitter rather than a carbon sink for the first time in recorded history.

Skeptics abound. The targets are ambitious and the timelines aggressive. Previous binding agreements have been violated by signatories with limited consequence. And the transition away from fossil fuels will require political will that many governments will find difficult to sustain through economic disruption and electoral cycles.

But something shifted in Nairobi. Whether it was the scale of recent damages, the insurance industry's defection from the denial coalition, or simply the weight of the evidence becoming genuinely undeniable, the room felt different from Glasgow or Dubai. The question is no longer whether the world is committed. The question is whether we can actually move fast enough.`,
    authorEmail: 'priya@blognest.com',
    publishedDate: new Date('2026-02-05'),
  },
  {
    title: 'The Sahara Solar Array: Powering Europe with African Sunlight',
    category: 'Climate',
    tags: ['Solar Energy', 'Renewable Energy', 'Africa', 'Climate Tech'],
    coverImage: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800&q=80&auto=format&fit=crop',
    excerpt: 'The TransMed Solar Project — the largest clean energy infrastructure in human history — began delivering power to European grids this spring. The numbers are almost incomprehensible.',
    body: `The TransMed Solar Project — the largest clean energy infrastructure project in human history — began delivering power to European grids this spring. The numbers are almost incomprehensible: 1,200 square kilometers of ultra-high-efficiency photovoltaic panels spread across the Algerian and Moroccan Sahara, connected by 3,800 kilometers of high-voltage direct-current cable running under the Mediterranean Sea to landing points in Spain, Italy, and Greece.

At full capacity, TransMed can generate 680 gigawatts — more than double the entire electricity consumption of France. The project, developed by a consortium of European energy companies, sovereign wealth funds from three Gulf states, and the Algerian national energy company Sonatrach, represents a $340 billion investment over nine years of construction.

The engineering challenges were immense. The Saharan environment — extreme heat, sandstorms, temperature variations of 40°C between day and night — demanded entirely new panel and mounting system designs. The submarine cable infrastructure required the deepest and longest HVDC cable runs ever laid. Sand management alone — preventing dune migration from burying the array — required a novel network of electrostatic sand barriers and mobile cleaning drones.

The political challenges were arguably more complex. Negotiating energy revenue sharing across four sovereign nations, multiple currencies, and three different legal traditions while satisfying European regulatory requirements took five years of continuous diplomacy. The resulting framework — in which Algeria and Morocco receive 27% of all electricity revenue generated — is being studied as a model for future international clean energy projects.

For Europe's energy security, the project is transformative. Post-Ukraine energy vulnerability is substantially resolved. For North Africa, it represents a new model of economic partnership with Europe — one based on natural resource endowment but, unlike oil and gas, sustainable.

The remaining challenge is what comes next. TransMed was designed for peak output, but solar doesn't generate at night. The consortium is already breaking ground on continent-scale grid-level storage. The age of renewable baseload power is beginning. The Sahara, which humans have long regarded as a barren wasteland, turns out to be one of the planet's most valuable energy assets.`,
    authorEmail: 'lucas@blognest.com',
    publishedDate: new Date('2026-05-12'),
  },
  {
    title: 'Ocean Acidification Reaches Critical Threshold: A Warning We Can\'t Ignore',
    category: 'Climate',
    tags: ['Ocean', 'Marine Biology', 'Climate Crisis', 'Environment'],
    coverImage: 'https://images.unsplash.com/photo-1518623489648-a173ef7824f3?w=800&q=80&auto=format&fit=crop',
    excerpt: 'The world\'s oceans have absorbed 30% of all CO₂ emissions since industrialization. That service, which has slowed climate change for decades, is reaching its physical limits.',
    body: `The world's oceans have absorbed 30% of all carbon dioxide emissions since the Industrial Revolution, providing humanity with a buffer against far worse warming than we have already experienced. That service is approaching its physical limits — and the consequences for marine ecosystems, food security, and global weather patterns are already being felt.

A landmark study published this month in Nature, synthesizing data from 4,200 ocean monitoring buoys deployed globally over the past decade, documents that surface ocean pH has dropped to 8.05 — representing a 30% increase in acidity relative to pre-industrial baseline. More alarming than the number itself is the rate of change: pH is now declining approximately 10 times faster than any measured change in Earth's geological record over the past 65 million years.

The practical consequences are cascading. Coral reef systems, which support roughly 25% of all ocean species despite covering less than 1% of the seafloor, are experiencing bleaching events of unprecedented frequency and severity. The Great Barrier Reef has now experienced seven mass bleaching events in eleven years; previous events occurred roughly once per decade. Reef recovery requires 10-15 years between bleaching events. The math has become brutal.

Shell-forming organisms — oysters, clams, sea urchins, pteropods (tiny sea snails that form the base of many polar food webs) — are struggling to maintain their shells in increasingly acidic water. In some areas of the Southern Ocean, pteropod shells are already visibly dissolving. The cascading effects on fish populations that depend on them are only beginning to manifest in catch data.

For food security, the stakes are enormous. Over three billion people depend on seafood as their primary protein source. The global fishing industry supports 600 million livelihoods. Current acidification trajectories suggest meaningful declines in shellfish and certain fish populations within 15-20 years without intervention.

There is no easy fix. Even if all CO₂ emissions ceased tomorrow, ocean acidification would continue for decades as the carbon already dissolved continues its chemical equilibration. The only solution is a combination of dramatic emissions reduction and, potentially, large-scale ocean alkalinity enhancement — a geoengineering approach whose effectiveness and side effects remain subjects of active research.`,
    authorEmail: 'sarah@blognest.com',
    publishedDate: new Date('2026-01-30'),
  },
  // Economy
  {
    title: 'Bitcoin Crosses $500,000: The Cryptocurrency Becomes a Global Reserve Asset',
    category: 'Economy',
    tags: ['Bitcoin', 'Cryptocurrency', 'Finance', 'Economy'],
    coverImage: 'https://images.unsplash.com/photo-1621761191319-c6fb62004040?w=800&q=80&auto=format&fit=crop',
    excerpt: 'When El Salvador adopted Bitcoin as legal tender in 2021, most economists laughed. Five years later, 23 central banks hold Bitcoin in their official reserves. Nobody\'s laughing.',
    body: `When El Salvador adopted Bitcoin as legal tender in 2021, most economists laughed. The consensus view was clear: Bitcoin was too volatile, too speculative, too energy-intensive to function as money. The experiment would fail, they said. Demonstrably wrong.

Five years later, 23 central banks hold Bitcoin in their official reserves, led by Switzerland, Singapore, Norway, and the UAE. The total market capitalization of Bitcoin exceeded $10 trillion last month, overtaking gold for the first time. The price crossed $500,000 per coin — a figure that once seemed like parody — in April, driven by a combination of institutional adoption, sovereign wealth fund accumulation, and genuine utility in international settlements.

The transformation has been driven by several converging developments. First, Bitcoin's Lightning Network, originally a niche payment system, has scaled to handle 12 million transactions per second, making micropayments practical and instantaneous. Second, AI-driven treasury management has made Bitcoin's volatility far more manageable for institutional holders who previously couldn't tolerate the risk profile. Third, and perhaps most significantly, international sanctions on Russia, Iran, Venezuela, and a growing list of other countries have demonstrated the fragility of dollar-denominated settlement systems to anyone who might one day be subject to them.

This last point is geopolitical dynamite. The dollar's role as global reserve currency gives the United States extraordinary leverage — the ability to effectively cut any country off from the global financial system. Multiple countries have actively sought alternatives. Bitcoin, decentralized by architecture and therefore not subject to unilateral American control, is the most viable one that exists.

The US response has evolved from hostility to reluctant accommodation. The Federal Reserve launched its own digital dollar in 2024, but uptake outside US borders has been limited. The Congressional Bitcoin Strategic Reserve Act, which would have the US Treasury accumulate one million Bitcoin, passed the Senate in March and awaits House action.

For retail investors who bought Bitcoin at $60,000 in 2021 and held through the crashes to $12,000 and back, the vindication is satisfying but somewhat hollow. The bigger story is structural: a technology born as a libertarian protest has become part of the financial establishment it once sought to circumvent.`,
    authorEmail: 'james@blognest.com',
    publishedDate: new Date('2026-04-30'),
  },
  {
    title: 'The Great Displacement: AI Automation\'s Real Toll on the Workforce',
    category: 'Economy',
    tags: ['AI', 'Jobs', 'Economy', 'Automation'],
    coverImage: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=800&q=80&auto=format&fit=crop',
    excerpt: 'The macro employment statistics look fine. The micro reality, for millions of displaced workers, is anything but. Here\'s what the headline numbers are hiding.',
    body: `The macro employment statistics look surprisingly fine. US unemployment stands at 4.1%, roughly in line with historic averages. European Union employment rates are at multi-decade highs. The predicted AI apocalypse for employment has, on the surface, not arrived.

Look beneath the surface, and the picture is more troubling. What is happening is not mass unemployment but mass displacement — a rapid and ongoing churn of workers from relatively well-paid, cognitively demanding jobs into lower-paid service sector roles, with enormous human costs that aggregate statistics are poorly designed to capture.

Consider the numbers that don't make headlines: legal services employment is down 34% from 2022 peaks. Financial analyst positions have declined 28%. Medical imaging specialists — radiologists, pathologists — are down 41% as AI systems match and exceed human diagnostic accuracy. Content creation employment has collapsed by 60%, absorbed partly by AI generation and partly by a smaller cadre of higher-paid human creators working alongside AI tools.

The workers displaced from these fields didn't become unemployed. They became baristas, delivery drivers, elder care workers, and retail staff — jobs that pay 40-60% less than what they left. The income loss is substantial. The identity loss is, for many, more devastating. A 45-year-old attorney who spent 20 years developing expertise in contract law doesn't experience a forced career change as an economic statistic. They experience it as a fundamental disruption of who they are.

Retraining programs — the standard political solution — face an awkward paradox: many of the careers workers are being retrained for are themselves vulnerable to the next wave of automation. Training radiologists to become AI trainers made sense in 2023. It is less obviously wise in 2026, when AI trainers themselves are being automated.

The political economy of this displacement is the sleeping giant of democratic politics. Those displaced workers are concentrated in specific geographies and age cohorts. They vote. They are angry in ways that don't match the measured tones of economic policy discussion. And the politicians who harness that anger are not always the ones with the most thoughtful policy solutions.`,
    authorEmail: 'priya@blognest.com',
    publishedDate: new Date('2026-03-25'),
  },
  {
    title: 'China\'s Digital Yuan Goes Global: The End of Dollar Dominance?',
    category: 'Economy',
    tags: ['China', 'Digital Currency', 'Geopolitics', 'Finance'],
    coverImage: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80&auto=format&fit=crop',
    excerpt: 'The digital yuan is now accepted in 47 countries for trade settlement. For the first time since Bretton Woods, the dollar\'s global role faces a credible challenge.',
    body: `The digital yuan — China's central bank digital currency, formally known as the e-CNY — is now the settlement currency for bilateral trade agreements between China and 47 countries, up from 12 at the start of 2024. For the first time since the Bretton Woods conference in 1944, the US dollar's role as the universal lubricant of global commerce faces a credible, systematic challenge.

The e-CNY's appeal is not primarily ideological. It's practical. For the dozens of countries that have signed on — ranging from Nigeria and Brazil to Iran, Saudi Arabia, and increasingly Southeast Asian economies — the digital yuan offers transaction costs that are a fraction of dollar-denominated systems, settlement times measured in seconds rather than days, and freedom from the correspondent banking networks that have long given the United States extraordinary surveillance and enforcement power.

That last point is the critical one. The US has weaponized dollar access with increasing frequency: sanctions on Russia, Iran, Venezuela, Cuba, and various designated organizations have effectively demonstrated that dollar dependence is a vulnerability. Countries that have no quarrel with US foreign policy objectives are nonetheless quietly diversifying. Nobody wants to be caught on the wrong side of a future sanctions regime.

The United States has responded with a combination of persuasion and pressure. Treasury Secretary Janet Yellen's successors have argued, with genuine force, that dollar displacement would reduce US ability to fund its own deficits cheaply — a consequence that would eventually harm the global economy. They have lobbied allies to resist e-CNY adoption.

The counter-argument, heard with increasing frequency in capitals from Riyadh to Jakarta: why should monetary sovereignty be forever contingent on American political decisions?

The dollar is not about to be displaced. It remains the dominant global reserve currency by an enormous margin, and the depth and liquidity of US financial markets have no peer. But the 60-year assumption that dollar primacy was both natural and permanent has been quietly retired. What replaces it is one of the defining financial questions of our era.`,
    authorEmail: 'lucas@blognest.com',
    publishedDate: new Date('2026-01-22'),
  },
  // Health
  {
    title: 'Universal Flu Vaccine Approved: The End of Annual Shots',
    category: 'Health',
    tags: ['Vaccine', 'Flu', 'Medicine', 'Public Health'],
    coverImage: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=800&q=80&auto=format&fit=crop',
    excerpt: 'The FDA has approved FluShield-U, the first vaccine that provides broad protection against all known influenza strains — including H5N1, the one that has worried pandemic planners for decades.',
    body: `The FDA has approved FluShield-U, developed by NIH researchers in collaboration with Moderna, making it the first influenza vaccine in history that provides durable broad-spectrum protection against all known influenza strains — including H5N1 avian influenza, which has been kept from fully adapting to human-to-human transmission only by luck and vigilance.

The approval marks the culmination of a 15-year research program that focused on the "stalk" region of the hemagglutinin protein — a part of the influenza virus that is largely conserved across strains, unlike the highly variable "head" that conventional vaccines target. By triggering an immune response against the stalk, FluShield-U provides protection that doesn't need annual updating as the virus mutates.

Phase III trial results were compelling. The vaccine showed 94% protection against matched strains and 78% protection against completely novel strains — including laboratory-created variants designed to probe the limits of its coverage. The protection was durable for at least four years with a single dose, though follow-up data is still being collected.

The public health implications are substantial. Influenza kills 250,000 to 650,000 people globally each year in normal seasons — a toll that, unlike pandemic deaths, generates relatively little media attention. The annual burden of disease is enormous: billions of sick days, hundreds of millions of hospitalizations, trillions of dollars in productivity loss.

More urgently, pandemic prevention experts have warned for two decades that a highly pathogenic avian influenza pandemic could kill tens of millions of people. H5N1 has a case fatality rate above 50% in known human infections; only the virus's limited human transmissibility has prevented a catastrophe. FluShield-U's effectiveness against H5N1 represents the first credible pharmacological prophylaxis against this threat.

The remaining challenge is distribution. At an initial manufacturing cost of approximately $35 per dose, the vaccine is affordable for wealthy nations but remains out of reach for low-income countries without international financing. A global vaccination campaign of the kind that would truly eliminate pandemic risk requires political will that has been unevenly distributed in previous health initiatives. The vaccine exists. The question, as always, is whether the world's institutions are up to the task of deploying it.`,
    authorEmail: 'sarah@blognest.com',
    publishedDate: new Date('2026-05-20'),
  },
  {
    title: 'Longevity Research Enters a New Era: Could We Live to 150?',
    category: 'Health',
    tags: ['Longevity', 'Anti-Aging', 'Biotech', 'Medicine'],
    coverImage: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&q=80&auto=format&fit=crop',
    excerpt: 'Three longevity drugs have entered Phase III clinical trials simultaneously — the most advanced lineup in the history of aging research. The science is more serious than the headlines suggest.',
    body: `Three distinct longevity interventions have simultaneously entered Phase III clinical trials — the final hurdle before FDA approval — representing the most advanced and credible pipeline in the history of aging research. The science is considerably more serious, and considerably more nuanced, than the breathless headlines about immortality might suggest.

The three approaches are distinct in mechanism. The first, rapamycin-derived mTOR inhibitors, have shown in animal models that periodic dosing can extend healthy lifespan by 25-40% by modulating cellular metabolism pathways associated with aging. Human data from early trials shows measurable improvements in immune function and cognitive resilience in adults over 70. The second approach uses senolytics — drugs that selectively destroy "zombie cells," or senescent cells, that accumulate with age and secrete inflammatory compounds that degrade surrounding tissue. The third involves epigenetic reprogramming, using Yamanaka factors to partially reset gene expression patterns to younger states.

Each approach has shown genuine promise in animal models and small human trials. The Phase III trials, involving a combined 45,000 participants across 30 countries, will provide the statistical power needed to distinguish real longevity benefits from placebo effects, confirm safety profiles at scale, and determine which patient populations benefit most.

The implications of successful outcomes are staggering to contemplate. Pension systems globally are already struggling with demographic aging; extending healthy lifespan by 15-20 years in wealthy countries would represent either a social policy catastrophe or a complete rethinking of the relationship between age, work, and retirement — probably both. The philosophical questions around whether extreme longevity is desirable, equitable, or ecologically sustainable are not frivolous.

What is clear from the research is that the science of aging has made more progress in the past decade than in the preceding century. The fundamental mechanisms that drive biological aging are better understood than ever. Whether we can intervene effectively in humans, at scale, affordably and safely — that's what the next five years of trial data will determine.`,
    authorEmail: 'james@blognest.com',
    publishedDate: new Date('2026-02-20'),
  },
  {
    title: 'AI Therapy Apps and the Mental Health Revolution: Real Help or Digital Snake Oil?',
    category: 'Health',
    tags: ['Mental Health', 'AI Therapy', 'Psychology', 'Technology'],
    coverImage: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80&auto=format&fit=crop',
    excerpt: 'Over 400 million people now use AI-powered mental health apps regularly. The clinical evidence for their effectiveness is mixed, complex, and crucial to understand.',
    body: `Over 400 million people use AI-powered mental health applications at least weekly — making conversational AI therapy the fastest-growing behavioral health intervention in history. The clinical evidence for their effectiveness is mixed, complex, and matters enormously for how we think about the global mental health crisis.

The crisis itself is not in dispute. The World Health Organization estimates that 970 million people live with a mental health disorder globally, with access to professional care available to perhaps 10-15% of them. In low and middle-income countries, the treatment gap exceeds 85%. Therapists are expensive, scarce, unevenly distributed, and largely inaccessible in the acute moments when people most need support — 2am on a Tuesday, in a rural area, in a language spoken by few practitioners.

AI therapy apps like Woebot, Wysa, and the newer GPT-4 powered platforms address this access problem with genuine effectiveness for specific use cases. Multiple randomized controlled trials have demonstrated that conversational AI can significantly reduce mild-to-moderate symptoms of depression and anxiety — roughly comparable in effect size to low-intensity human-delivered CBT. For populations with no access to professional care, something is demonstrably better than nothing.

The concerns are serious and shouldn't be dismissed. AI systems are trained on text and lack the embodied, relational attunement that many therapists consider central to effective work with trauma, psychosis, severe depression, and suicidality. Several documented cases involve AI systems providing inappropriate responses to users in acute crisis. The platforms are largely unregulated, with highly variable quality. And the convenience of AI therapy creates risk of becoming a substitute for professional care rather than a bridge to it.

The emerging consensus among mental health professionals is nuanced: AI applications have genuine value as a first line of accessible support for mild-to-moderate difficulties, as a complement to professional therapy (extending therapeutic hours and providing between-session support), and as a triage tool to identify people who need higher levels of care. They are not, and should not be marketed as, a replacement for human clinical care in complex cases.

What the 400 million users using these apps already know is simpler: having something to talk to in a moment of distress, even an algorithm, often helps. The work of the next decade is making sure that something is as good as it can possibly be.`,
    authorEmail: 'priya@blognest.com',
    publishedDate: new Date('2026-03-30'),
  },
  // Additional posts for variety
  {
    title: 'The Creator Economy Hits $1 Trillion: How Millions Built Businesses From Nothing',
    category: 'Economy',
    tags: ['Creator Economy', 'Social Media', 'Entrepreneurship', 'Digital'],
    coverImage: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=800&q=80&auto=format&fit=crop',
    excerpt: 'What began as YouTube monetization and Patreon subscriptions has grown into a $1 trillion economy employing 200 million people worldwide. The rules of work have fundamentally changed.',
    body: `What began as YouTube monetization and Patreon subscriptions has grown into a $1 trillion economy employing 200 million people worldwide. The creator economy — encompassing everyone from newsletter writers with 10,000 subscribers to video producers with audiences of 50 million — has fundamentally rewritten the relationship between talent, audience, and economic value.

The numbers are now genuinely staggering. An estimated 47 million people globally self-identify as "full-time creators," generating more than 50% of their income from digital content. Another 150 million participate as part-time creators. The infrastructure supporting them — platforms, tools, analytics, monetization products, creator funds — has become one of the fastest-growing sectors of the economy, attracting over $8 billion in venture investment in 2025 alone.

The diversity of the creator economy defies simple characterization. At one end are mega-creators with podcast networks, merchandise lines, and production companies that employ dozens. At the other are individual experts — engineers, doctors, lawyers, teachers — who monetize their knowledge through paid communities, courses, and consulting arranged through their audience. In between is an enormous middle class of creators earning $50,000-$200,000 annually from a combination of sponsorships, subscriptions, and product sales.

AI has paradoxically both threatened and accelerated this economy. For commodity content — stock articles, generic explainer videos, template social posts — AI generation has driven prices to near zero. For content that offers genuine expertise, personality, perspective, or emotional connection, human creators remain irreplaceable and, in many niches, more valuable than ever.

The cultural implications are at least as significant as the economic ones. The creator economy has democratized who gets to speak and be heard in ways that are genuinely unprecedented. A nurse in the Philippines can build a global audience for evidence-based health information. A history teacher in Nigeria can make Ancient Egypt feel personally relevant to teenagers in Stockholm.

It has also created new anxieties: algorithm dependency, parasocial relationship dynamics, the burnout that comes from treating one's personality as a business. The labor protections, tax frameworks, and social safety nets designed for a world of employment relationships don't map cleanly onto a world of one-person media companies.`,
    authorEmail: 'lucas@blognest.com',
    publishedDate: new Date('2026-05-08'),
  },
  {
    title: 'Electric Vehicles Now Outsell Combustion Cars: The Auto Industry\'s Quiet Revolution',
    category: 'Climate',
    tags: ['Electric Vehicles', 'Auto Industry', 'Climate Tech', 'Energy'],
    coverImage: 'https://images.unsplash.com/photo-1593941707882-a5bba14938c7?w=800&q=80&auto=format&fit=crop',
    excerpt: 'For the first time in history, electric vehicles outsold internal combustion engine cars globally in Q1 2026. The energy transition in transportation arrived faster than anyone predicted.',
    body: `For the first time in history, electric vehicles outsold internal combustion engine cars globally in Q1 2026, capturing 51.3% of new car sales. The milestone, while symbolically significant, understates how thoroughly the auto industry's energy transition has already progressed: in China the EV share is 78%, in Europe 63%, and even in the United States — long the laggard — EVs now represent 44% of new vehicle sales.

The inflection point wasn't any single technological breakthrough but the cumulative effect of several simultaneous developments. Battery costs, which had already fallen 97% since 2010, crossed the $50 per kilowatt-hour threshold in late 2024 — the point at which EV manufacturing costs actually fall below equivalent combustion vehicles without subsidies. Simultaneously, charging infrastructure reached sufficient density in most urban markets to effectively eliminate range anxiety for the majority of driving patterns. And the product quality of second and third-generation EVs reached a point where consumers actively prefer the driving experience.

The disruption to incumbent automakers has been severe. Ford and GM have both announced accelerated phase-outs of their internal combustion product lines, pulling forward timelines by three to five years. The German automotive industry — historically resistant to EV transition — has made the pivot more thoroughly and credibly than critics expected, with Volkswagen now producing the world's best-selling EV platform.

The geopolitical rearrangements are profound. Oil-dependent economies face an existential transition: the International Energy Agency's central scenario projects peak oil demand in 2027, with rapid decline thereafter. Saudi Arabia's Vision 2030 diversification program takes on new urgency. Russia's already-stressed economy faces structural headwinds from declining fossil fuel revenues.

The supply chain implications are their own geopolitical drama. Lithium, cobalt, nickel, and rare earth elements — critical for battery manufacturing — are concentrated in a handful of countries, several of them with complex relationships with the Western democracies driving EV adoption. The next phase of the auto industry's transition will be a competition not just for market share but for the raw materials on which that market depends.`,
    authorEmail: 'sarah@blognest.com',
    publishedDate: new Date('2026-04-25'),
  },
  {
    title: 'China\'s Lunar Station Breaks Ground: A New Era of Space Competition',
    category: 'Science',
    tags: ['China', 'Space', 'Moon', 'Geopolitics'],
    coverImage: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=800&q=80&auto=format&fit=crop',
    excerpt: 'China\'s Chang\'e 10 mission has begun construction of a permanent lunar research station at the Moon\'s south pole, just 120 kilometers from NASA\'s planned Artemis base camp.',
    body: `China's Chang'e 10 mission, which landed at the Moon's south pole in January 2026, has begun construction of what Beijing officially designates the International Lunar Research Station — a permanent outpost whose first modular components are now functional, housing scientific equipment and awaiting crewed occupation planned for 2028.

The site is notable: just 120 kilometers from NASA's planned Artemis Base Camp, both programs have independently identified the Shackleton-de Gerlache ridge as the optimal location for permanent habitation — near-constant sunlight for solar power, access to water ice, and favorable terrain for surface operations. The proximity is not accidental. The south pole's resources make it the Moon's most valuable real estate. There is, as yet, no legal framework governing lunar territory or resource rights.

The Outer Space Treaty of 1967 prohibits national sovereignty over celestial bodies but says nothing clear about resource extraction. The Artemis Accords, signed by 32 nations, establish a set of norms around transparency and safety zones but have been rejected by China, Russia, and most nations outside the Western alliance. The legal vacuum is, in the polite phrase of space policy experts, "a matter of ongoing discussion."

Less diplomatically: two of the world's most powerful nations are simultaneously constructing permanent outposts in the same small area of the Moon, with conflicting frameworks for what they're allowed to do there, and no agreed authority to mediate disputes. The analogy to Antarctica — where the Antarctic Treaty has managed similar tensions since 1959 — is frequently invoked by optimists. The contrast to the South China Sea, where overlapping territorial claims have been managed primarily through military presence, is invoked by pessimists.

What is clear is that the Moon has ceased to be an arena of scientific exploration and become an arena of great power competition. The race is not just for flags and footprints but for the water ice that will determine who can economically operate beyond Earth orbit — and for the strategic position that comes with being first to establish a durable presence.`,
    authorEmail: 'james@blognest.com',
    publishedDate: new Date('2026-02-10'),
  },
]

async function main() {
  const client = await pool.connect()
  console.log('Connected to Neon DB')

  try {
    // Create authors
    const authorIds: Record<string, string> = {}
    for (const author of AUTHORS) {
      const existing = await client.query('SELECT id FROM users WHERE email = $1', [author.email])
      if (existing.rows.length > 0) {
        authorIds[author.email] = existing.rows[0].id
        console.log(`Author exists: ${author.email}`)
        continue
      }
      const hashed = await bcrypt.hash(author.password, 12)
      const id = cuid()
      await client.query(
        'INSERT INTO users (id, email, password, name, role, "createdAt", "updatedAt") VALUES ($1, $2, $3, $4, $5, NOW(), NOW())',
        [id, author.email, hashed, author.name, author.role]
      )
      authorIds[author.email] = id
      console.log(`Created author: ${author.name} (${author.email})`)
    }

    // Check how many posts already exist
    const existingPosts = await client.query('SELECT COUNT(*) FROM posts')
    const postCount = parseInt(existingPosts.rows[0].count)
    if (postCount > 0) {
      console.log(`${postCount} posts already exist, skipping seed.`)
      return
    }

    // Create posts
    for (const post of POSTS) {
      const authorId = authorIds[post.authorEmail]
      if (!authorId) {
        console.warn(`No author found for ${post.authorEmail}, skipping post`)
        continue
      }
      const id = cuid()
      await client.query(
        `INSERT INTO posts (id, title, body, excerpt, "coverImage", category, tags, "authorId", "publishedDate", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())`,
        [id, post.title, post.body, post.excerpt, post.coverImage, post.category, post.tags, authorId, post.publishedDate]
      )
      console.log(`Created post: ${post.title.slice(0, 60)}...`)
    }

    console.log(`\nSeed complete! Created ${AUTHORS.length} authors and ${POSTS.length} posts.`)
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
