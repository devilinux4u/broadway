interface NewsletterProps {
  data?: Record<string, any>;
}

const Newsletter = ({ data = {} }: NewsletterProps) => {
  const nl = data || {};

  const tagline = nl.tagline || "";
  const title = nl.title || "";
  const description = nl.description || "";
  const buttonText = nl.button_text || "";

  if (!title && !description) {
    return null;
  }

  return (
    <section className="py-12 md:py-16 bg-foreground text-background">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm tracking-[0.3em] uppercase text-primary mb-3">{tagline}</p>
        <h2 className="font-display text-4xl md:text-5xl font-semibold mb-4">{title}</h2>
        <p className="text-background/60 max-w-lg mx-auto mb-8">{description}</p>
        <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto" onSubmit={(e) => e.preventDefault()}>
          <input type="email" placeholder="Your email address" className="flex-1 px-5 py-3 bg-background/10 border border-background/20 rounded-sm text-sm text-background placeholder:text-background/40 focus:outline-none focus:border-primary transition-colors" />
          <button type="submit" className="px-8 py-3 bg-primary text-primary-foreground text-sm font-medium tracking-wide rounded-sm hover:bg-primary/90 transition-colors">
            {buttonText}
          </button>
        </form>
      </div>
    </section>
  );
};

export default Newsletter;
