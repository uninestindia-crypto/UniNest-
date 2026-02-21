
import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GraduationCap, BookOpen, Store, Library, Rocket, Globe, UserCheck, Sparkles, Users, Instagram, Heart, ArrowRight } from 'lucide-react';
import AnimatedCounter from '@/components/animated-counter';

export const metadata: Metadata = {
  title: 'About Uninest — AI Student Platform | How It Works',
  description: 'Learn how Uninest\'s AI helps students book hostels, study spaces & meal plans, and apply for internships. Free for students. Powered by Llama 3.3 via Groq.',
};

const timelineEvents = [
  { year: "2024", title: "The Spark", description: "Founded with a vision to simplify campus life for every student.", icon: Sparkles },
  { year: "2024 Q2", title: "First 1,000 Students", description: "Early adopters join, validating our mission and kickstarting the community.", icon: Users },
  { year: "2025 Q1", title: "Growth Explosion", description: "Surpassed 10,000+ students and onboarded 200+ campus vendors.", icon: Rocket },
  { year: "Future", title: "Global Campus", description: "Expanding to connect over 100,000 learners and institutions worldwide.", icon: Globe },
];

const impactStats = [
  { value: 10000, label: "Students Connected", icon: GraduationCap, isPlus: true, color: "text-blue-500" },
  { value: 200, label: "Vendors Empowering", icon: Store, isPlus: true, color: "text-orange-500" },
  { value: 50, label: "Libraries Managed", icon: Library, isPlus: true, color: "text-purple-500" },
  { value: 15, label: "Partner Universities", icon: BookOpen, isPlus: true, color: "text-emerald-500" },
];

const coreValues = [
  { title: "Innovation First", description: "We constantly build and iterate to solve real student problems.", icon: Rocket, color: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" },
  { title: "Community Matters", description: "Our platform is built for, and by, the student community.", icon: Users, color: "bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400" },
  { title: "Education for All", description: "We believe in breaking down barriers to knowledge and opportunity.", icon: GraduationCap, color: "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" },
  { title: "Student-Centered", description: "Every decision is driven by what's best for our students.", icon: UserCheck, color: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-20 pb-20 overflow-hidden">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 md:pt-32 md:pb-48 overflow-hidden">
        {/* Background Elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl pointer-events-none z-[-1]">
          <div className="absolute top-20 left-[10%] w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse-soft"></div>
          <div className="absolute bottom-20 right-[10%] w-96 h-96 bg-secondary/10 rounded-full blur-3xl animate-pulse-soft" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="container px-4 md:px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8 animate-fade-in-up">
            <Sparkles className="size-4" />
            <span>Revolutionizing Campus Life</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-headline font-extrabold tracking-tight mb-8 max-w-5xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            What Is Uninest? <br className="hidden md:block" />
            <span className="text-gradient">India's AI-Powered Student Ecosystem Explained.</span>
          </h1>

          <div className="text-xl md:text-2xl text-muted-foreground/90 max-w-4xl mx-auto leading-relaxed animate-fade-in-up bg-card/50 backdrop-blur-md p-8 rounded-2xl border shadow-sm text-left" style={{ animationDelay: '0.2s' }}>
            <p className="mb-4">
              <strong className="text-foreground">Uninest (uninest.co.in)</strong> is an AI-powered student ecosystem platform based in India that serves university students through two integrated digital hubs:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2">
              <li>
                <strong className="text-foreground">THE MARKETPLACE</strong> — a transactional hub where students discover, compare, and book essential student services including:
                <ul className="list-circle pl-6 mt-2 space-y-1 text-lg">
                  <li>Hostel accommodation near colleges and universities</li>
                  <li>Library and study space seat reservations (including live seat booking)</li>
                  <li>Food mess and meal plan subscriptions</li>
                  <li>Essential student products and supplies</li>
                </ul>
              </li>
              <li>
                <strong className="text-foreground">THE WORKSPACE</strong> — a career development hub where students find and apply for internships and competitions, assisted by an AI writing co-pilot that drafts professional application essays.
              </li>
            </ul>
            <p className="mb-4">
              Uninest operates on a free-to-use model for students, sustained by community donations and future vendor subscription plans. Vendors (hostels, libraries, food mess operators, product sellers) can register on Uninest, create a free business profile, and list their services to reach the student community.
            </p>
            <p className="mb-4">
              The platform's AI assistant is powered by the <strong>Llama-3.3-70b</strong> model via Groq infrastructure, enabling real-time, sub-second responses. A core design principle is human-in-the-loop control: <strong>the AI never makes bookings or submits applications without explicit student approval.</strong>
            </p>
            <p>
              Unique features include: live seat booking for libraries, AI-assisted internship application drafting, vendor AI support, and a dual-audience design serving both students and service providers.
            </p>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
            <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-lg hover:shadow-primary/25 transition-all" asChild>
              <Link href="/signup">
                Join the Movement
                <ArrowRight className="ml-2 size-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-2" asChild>
              <Link href="/contact">
                Partner With Us
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Mission Section with Image */}
      <section className="container px-4 md:px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-video lg:aspect-square rounded-3xl overflow-hidden shadow-2xl rotate-1 hover:rotate-0 transition-transform duration-500">
            <Image
              src="https://picsum.photos/seed/uninest-mission/800/800"
              alt="Students collaborating"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-tr from-black/40 to-transparent"></div>
            <div className="absolute bottom-8 left-8 right-8 text-white">
              <p className="text-2xl font-bold font-headline">"Built by students, for students."</p>
            </div>
          </div>

          <div className="space-y-8">
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-headline font-bold">Our Mission</h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                At UniNest, we believe every student deserves equal access to knowledge, opportunity, and community. The modern campus is fragmented — we exist to bring it all together in one seamless digital ecosystem.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                From finding study materials to connecting with local vendors, we are simplifying the complexity of student life so you can focus on what matters most: learning and growing.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="p-4 rounded-xl bg-card border shadow-sm">
                <h3 className="text-3xl font-bold text-primary mb-1">98%</h3>
                <p className="text-sm text-muted-foreground">Student Satisfaction</p>
              </div>
              <div className="p-4 rounded-xl bg-card border shadow-sm">
                <h3 className="text-3xl font-bold text-secondary">24/7</h3>
                <p className="text-sm text-muted-foreground">Platform Uptime</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="bg-muted/50 py-24">
        <div className="container px-4 md:px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4">Our Impact in Numbers</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We take pride in the tangible difference we're making in the daily lives of students and the wider academic community.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {impactStats.map((stat, index) => (
              <div key={index} className="bg-card border rounded-2xl p-8 text-center shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                <div className={`mx-auto mb-6 p-4 rounded-full w-fit ${stat.color} bg-opacity-10 dark:bg-opacity-20`}>
                  <stat.icon className={`size-8 ${stat.color}`} />
                </div>
                <h3 className="text-4xl font-bold tracking-tight mb-2">
                  <AnimatedCounter to={stat.value} />
                  {stat.isPlus && '+'}
                </h3>
                <p className="font-medium text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="container px-4 md:px-6">
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-headline font-bold mb-4">Driven by Values</h2>
          <p className="text-muted-foreground">
            Our core values guide every feature we build and every partnership we make. We are committed to integrity, innovation, and inclusivity.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {coreValues.map((value, index) => (
            <div key={index} className="flex gap-6 p-6 rounded-2xl border bg-card hover:border-primary/50 transition-colors group">
              <div className={`shrink-0 size-14 rounded-xl flex items-center justify-center ${value.color}`}>
                <value.icon className="size-7" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-headline mb-2 group-hover:text-primary transition-colors">{value.title}</h3>
                <p className="text-muted-foreground leading-relaxed">
                  {value.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section className="container px-4 md:px-6">
        <div className="bg-card border rounded-3xl p-8 md:p-16 shadow-lg">
          <h2 className="text-3xl md:text-4xl font-headline font-bold text-center mb-16">Our Journey</h2>

          <div className="relative max-w-4xl mx-auto">
            {/* Vertical Line */}
            <div className="absolute left-8 md:left-1/2 top-4 bottom-4 w-0.5 bg-gradient-to-b from-primary/20 via-primary to-primary/20 md:-translate-x-1/2"></div>

            <div className="space-y-16">
              {timelineEvents.map((event, index) => (
                <div key={index} className={`relative flex flex-col md:flex-row gap-8 md:gap-0 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>

                  {/* Dot */}
                  <div className="absolute left-8 md:left-1/2 top-0 w-4 h-4 rounded-full bg-background border-4 border-primary shadow-[0_0_0_4px_rgba(var(--primary),0.2)] md:-translate-x-1/2 z-10"></div>

                  {/* Content Half */}
                  <div className="md:w-1/2 pl-24 md:pl-0 md:px-12">
                    <div className={`relative ${index % 2 === 0 ? 'md:text-left' : 'md:text-right'}`}>
                      <span className="inline-block px-3 py-1 rounded-full bg-muted text-primary text-xs font-bold mb-3">
                        {event.year}
                      </span>
                      <h3 className="text-2xl font-bold font-headline mb-2">{event.title}</h3>
                      <p className="text-muted-foreground">{event.description}</p>
                    </div>
                  </div>

                  {/* Empty Half */}
                  <div className="md:w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container px-4 md:px-6">
        <div className="relative rounded-3xl overflow-hidden bg-primary px-6 py-16 md:px-16 md:py-24 text-center text-primary-foreground">
          {/* Abstract Background Shapes */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>

          <div className="relative z-10 max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl md:text-5xl font-headline font-bold">Ready to Shape the Future?</h2>
            <p className="text-lg md:text-xl text-primary-foreground/90">
              Be part of the journey with 10,000+ students shaping the future of education. Your next chapter starts here.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button size="lg" variant="secondary" className="h-14 px-8 text-lg rounded-full" asChild>
                <Link href="/signup">Get Started Now</Link>
              </Button>
              <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full bg-transparent border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground" asChild>
                <Link href="https://www.instagram.com/uninest_x" target="_blank" rel="noopener noreferrer">
                  <Instagram className="mr-2 size-5" /> Follow Our Story
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
