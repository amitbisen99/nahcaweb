import Image from "next/image";
import { SVGProps } from "react";
import { Container } from "@/components/Container";

function DiamondIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2l5 10-5 10-5-10z" />
    </svg>
  );
}

interface BoardMember {
  name: string;
  title: string;
  photo: string;
  bio: string[];
}

const BOARD_MEMBERS: BoardMember[] = [
  {
    name: "Dr. Shamā Mehtā",
    title: "NAHCA Chair",
    photo: "/board/shama-mehta.jpg",
    bio: [
      "Dr. Shama Mehta is a Board Certified Chaplain and Certified Educator Candidate at Michigan Medicine. She is also a co-founder and vice-chair for North American Hindu Chaplains Association.",
      "As the first Indian Hindu Board Certified Chaplain in the United States, she brings a unique perspective to navigating cultural identities, personal growth, and professional development. With over 12 years of healthcare experience and a Doctorate in Ministry, Dr. Mehta specializes in bridging traditional wisdom with contemporary challenges. As a Certified Educator Candidate at Michigan Medicine, she mentors future spiritual caregivers and develops innovative resources that blend Hindu principles with practical life management tools. Her work focuses on helping individuals find resilience, purpose, and alignment across personal and professional domains.",
      "Dr. Mehta has created DharmicAlly that offers spiritually-oriented planners and guided journals which support multicultural professionals in managing stress, defining personal goals, and integrating spiritual insights into everyday life.",
    ],
  },
  {
    name: "Sanjay Mathur",
    title: "NAHCA Vice Chair & Treasurer",
    photo: "/board/sanjay-mathur.png",
    bio: [
      "Mr. Sanjay Mathur serves as the Hindu Affiliate of Spirituality & Religious Life at Rochester Institute of Technology. He is the past president and currently on the Board of Trustees at the Hindu Temple of Rochester and also serves on the Board of Directors of Heritage Christian Services which supports individuals with special needs. He is a long-standing and very popular invited speaker for the annual Global Citizenship Conference held by Nazareth College's Hickey Center of Interfaith Studies and Dialogue and has delivered talks on Hinduism at conferences held by Duke and Georgetown Universities.",
      "Sanjay has also been involved in Research Workshops on Spirituality and Health at the Duke Center for Spirituality, Theology and Health. Sanjay is among a handful of Hindus in the US with clinical pastoral education experience, that is to say, professional learning and credentialing recognized in the domain of healthcare chaplaincy. Sanjay has very recently been appointed as a Hindu affiliate of Spirituality & Religious Life at his alma mater, Rochester Institute of Technology. For his vocation, Sanjay works in the field of IT.",
    ],
  },
  {
    name: "Bindu Gupta",
    title: "NAHCA Membership Chair",
    photo: "/board/bindu-gupta.jpeg",
    bio: [
      "Bindu Gupta is an educator, artist, and Hindu spiritual care leader committed to advancing professional chaplaincy and cultivating inclusive spiritual communities. She is a graduate of the Interreligious Chaplaincy Program at the Graduate Theological Union and the Hindu Chaplaincy Program at the Hindu Spiritual Care Institute, where she developed a strong foundation in interfaith engagement and pastoral care.",
      "Her professional experience includes disaster spiritual care with the American Red Cross and facilitating workshops at Wellesley College and Williams College. Her university programs focus on spiritual resilience, interfaith dialogue, contemplative practice, and creative expression as pathways to mental and emotional well-being.",
      "For the past seven years, Bindu has offered mindful, meditative healing art workshops throughout her Massachusetts community, using art as a therapeutic and contemplative modality to support reflection, stress reduction, and spiritual grounding. During the COVID-19 pandemic, she expanded these offerings globally through virtual platforms, fostering connection and creative healing during a time of isolation. Bridging academic settings, community engagement, and Hindu spiritual care, Bindu integrates scholarship, contemplative practice, and creative expression to cultivate belonging and holistic well-being.",
      "As Treasurer and Membership Co-Chair of NAHCA, she contributes to fiscal stewardship, membership development, and the continued advancement of professional Hindu spiritual care across North America.",
    ],
  },
  {
    name: "Jer Bryant",
    title: "NAHCA Secretary",
    photo: "/board/jer-bryant.jpg",
    bio: [
      "Jer Bryant is the Associate University Chaplain at University of Lynchburg in Lynchburg, Virginia. In 2019, Jer became the university's first interfaith chaplain, and in 2024, he was promoted to his current role. Jer is also an Associate Professor of English and has been a member of the English Department since 2010. He holds a Master of Arts in English from University of Lynchburg and a Master of Fine Arts in Creative Writing from West Virginia Wesleyan College. His writing can be found in the anthology Chronic Poetics, Anima Magazine, EOAGH: A Journal of the Arts, K'in Literary Journal, and more. Jer is the recipient of the 2025 Shirley E. Rosser Award for Excellence in Teaching — one of the highest honors for faculty at Lynchburg.",
      "As a chaplain, Jer works to create room at the Spiritual Table for all beings. His spiritual care work focuses on creating a sense of spiritual belonging for all people, including religious minorities and members of the LGBTQIA+ community. He also gives talks on compassion, provides lectures on religion and medicine, and teaches a Medical Humanities course (\"Health Narratives\") on suffering, death, and grief.",
      "Jer is passionate about interfaith dialogue, religious/spiritual belonging, and presence. His entire spiritual journey began long ago when he was a middle school student in a small town in Virginia. One day, he discovered a book about India on his teacher's shelf, and after reading it, his deep love of Hinduism began to blossom. For over two decades, Jer has independently studied Judaism, Buddhism, and Hinduism. His own spiritual practice involves meditation, chanting, and prayer. In his free time, Jer enjoys having coffee with his family and friends, watching baking shows, admiring the Blue Ridge Mountains, and reading and writing poetry.",
    ],
  },
];

export default function AboutPage() {
  return (
    <>
      {/* NAHCA Board */}
      <section id="board" className="bg-white py-20">
        <Container>
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 font-heading text-xs font-semibold uppercase tracking-widest text-brand">
              <DiamondIcon className="h-3 w-3" />
              About Us
            </span>
            <h1 className="mt-3 font-heading text-4xl font-bold text-ink">NAHCA Board</h1>
            <p className="mt-4 text-ink/70">
              Meet the volunteer leaders who guide NAHCA&apos;s mission to support Hindu chaplains and
              the communities they serve.
            </p>
          </div>

          <div className="mt-14 flex flex-col gap-16">
            {BOARD_MEMBERS.map((member) => (
              <div key={member.name} className="grid gap-8 sm:grid-cols-[180px_1fr] sm:items-start">
                <div className="mx-auto h-[180px] w-[180px] flex-none overflow-hidden rounded-full sm:mx-0">
                  <Image
                    src={member.photo}
                    alt={member.name}
                    width={180}
                    height={180}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="text-center sm:text-left">
                  <h2 className="font-heading text-xl font-medium text-ink">{member.name}</h2>
                  <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-brand">
                    {member.title}
                  </p>
                  <div className="mt-4 flex flex-col gap-4 text-ink/75">
                    {member.bio.map((paragraph, i) => (
                      <p key={i}>{paragraph}</p>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
