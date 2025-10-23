
CardHeader>
                    <CardTitle className="text-2xl font-semibold tracking-tight">{collection.title}</CardTitle>
                    <CardDescription>{collection.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pb-6">
                    <Button variant="link" className="px-0" asChild>
                      <Link href={collection.href}>
                        Shop now
                        <ArrowRight className="ml-2 size-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {stats.map(({ icon: iconName, ...stat }, index) => {
              const IconComponent = resolveIcon(iconName, Users);
              return <StatCard key={index} {...stat} icon={IconComponent} />;
            })}
          </div>
        </section>

        <section>
          <h2 className="text-3xl font-headline font-bold text-center mb-8 md:mb-12">Loved by Students Everywhere</h2>
          <Carousel
            opts={{ align: 'start', loop: true }}
            plugins={[Autoplay({ delay: 5000 })]}
            className="w-full max-w-5xl mx-auto"
          >
            <CarouselContent className="-ml-2 md:-ml-4">
              {testimonials.map((testimonial, index) => (
                <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <Card className="h-full">
                      <CardContent className="flex flex-col items-center text-center justify-center p-6 gap-3">
                        <Avatar className="h-20 w-20 border-4 border-primary/20">
                          <AvatarImage src={testimonial.avatar} alt={testimonial.name} width={80} height={80} />
                          <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <p className="text-muted-foreground italic">"{testimonial.quote}"</p>
                        <div>
                          <p className="font-bold">{testimonial.name}</p>
                          <p className="text-sm text-muted-foreground">{testimonial.school}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden md:flex" />
            <CarouselNext className="hidden md:flex" />
          </Carousel>
        </section>

        <section>
          <h2 className="text-3xl font-headline font-bold text-center mb-8 md:mb-12">Our Journey So Far</h2>
          <div className="grid md:grid-cols-4 gap-x-6 gap-y-10 max-w-5xl mx-auto">
            {timeline.map((item) => {
              const IconComponent = resolveIcon(item.icon, Sparkles);
              return (
              <div key={item.title} className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="bg-primary/10 text-primary rounded-full p-4 border-2 border-primary/20 shadow-sm">
                    <IconComponent className="size-8" />
                  </div>
                </div>
                <p className="text-muted-foreground text-sm">{item.year}</p>
                <h3 className="font-headline font-semibold text-xl">{item.title}</h3>
                <p className="text-muted-foreground">{item.description}</p>
              </div>
            );
            })}
          </div>
        </section>

        <section className="text-center rounded-2xl bg-gradient-to-r from-primary via-primary/90 to-primary/80 p-8 text-primary-foreground shadow-xl md:p-12">
          <h2 className="text-3xl font-bold font-headline">Don’t Miss Out.</h2>
          <p className="mt-2 max-w-2xl mx-auto text-primary-foreground/90">
            Be part of the fastest-growing student movement and supercharge your campus life.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" variant="secondary" className="text-lg" asChild>
              <Link href="/signup">Get Started Now 🚀</Link>
            </Button>
            <Button size="lg" variant="ghost" className="text-lg text-primary-foreground hover:bg-primary-foreground/10" asChild>
              <Link href="/about">Learn more about UniNest</Link>
            </Button>
          </div>
        </section>
      </div>
    </>
  );
}
