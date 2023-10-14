# Inline elements showcase

Markdown offers a lot of different inline elements. Here are some examples: **bold text**, _italic text_, `code`, ~~strikethrough~~, [links](https://www.markdownguide.org/ "markdown guide"), and images.

Over hill, over dale,  
Thorough bush, thorough brier,  
Over park, over pale,  
Thorough flood, thorough fire!  
I do wander everywhere,  
Swifter than the moon's sphere;  
And I serve the Fairy Queen,  
To dew her orbs upon the green;  
The cowslips tall her pensioners be;  
In their gold coats spots you see;  
Those be rubies, fairy favours;  
In those freckles live their savours;  
I must go seek some dewdrops here,  
And hang a pearl in every cowslip's ear.

-- William Shakespeare

# Table showcase

| Name       | Description         | Country  |                              Ingriedients |
| ---------- | :------------------ | :------: | ----------------------------------------: |
| Pot-au-feu | A French beef stew. |  France  |                          Beef, vegetables |
| Bigos      | A Polish stew.      |  Poland  |                             Meat, cabbage |
| Goulash    | A Hungarian stew.   | Hungary  |                             Beef, paprika |
| Borscht    | A Ukrainian stew.   | Ukraine  |                                  Beetroot |
| Haggis     | A Scottish stew.    | Scotland |            Sheep's heart, liver and lungs |
| Irish stew | An Irish stew.      | Ireland  | Lamb or mutton, potatoes, onions, carrots |

# Lists showcase

[The 12 Principles behind the Agile Manifesto](https://www.agilealliance.org/agile101/12-principles-behind-the-agile-manifesto/)

- Our highest priority is to satisfy the customer through the early and
  continuous delivery of valuable software.
- Welcome changing requirements, even late in development. Agile processes
  harness change for the customer’s competitive advantage.
- Deliver working software frequently, from a couple of weeks to a couple of
  months, with a preference to the shorter timescale.
- Business people and developers must work together daily throughout the
  project.
- Build projects around motivated individuals. Give them the environment and
  support they need, and trust them to get the job done.
- The most efficient and effective method of conveying information to and within
  a development team is face-to-face conversation.
- Working software is the primary measure of progress.
- Agile processes promote sustainable development. The sponsors, developers, and
  users should be able to maintain a constant pace indefinitely.
- Continuous attention to technical excellence and good design enhances agility.
- Simplicity–the art of maximizing the amount of work not done–is essential.
- The best architectures, requirements, and designs emerge from self-organizing
  teams.
- At regular intervals, the team reflects on how to become more effective, then
  tunes and adjusts its behavior accordingly.

[Seven Principles of Software Testing](https://se.inf.ethz.ch/~meyer/publications/testing/principles.pdf)
by Bertrand Meyer

1. Definition
   - To test a program is to try to make it fail.
2. Tests versus specs
   - Tests are no substitute for specifications.
3. Regression testing
   - Any failed execution must yield a test case, to remain a permanent part of
     the project’s test suite.
4. Applying oracles
   - Determining success or failure of tests must be an automatic process.
5. Manual and automatic test cases
   - An effective testing process must include both manually and automatically
     produced test cases.
6. Empirical assessment of testing strategies
   - Evaluate any testing strategy, however attractive in principle, through
     objective assessment using explicit criteria in a reproducible testing
     process.
7. Assessment criteria
   - A testing strategy’s most important property is the number of faults it
     uncovers as a function of time.

# Block quote showcase

> No amount of evidence will ever persuade an idiot
>
> -- Mark Twain

---

Subject: Re: Team Meeting Rescheduled

Hi All,

Regarding the rescheduling of our team meeting, I agree with Jenna's suggestion to move it to Thursday.

> On Tue, Oct 10, 2023 at 4:15 PM, Jenna wrote:
>
> > Hi Team,
> >
> > Considering the upcoming public holiday on Friday, I suggest we move our weekly team meeting to Thursday at the same time. What do you all think?
> >
> > > On Tue, Oct 10, 2023 at 3:00 PM, Mark wrote:
> > >
> > > > Hi All,
> > > >
> > > > Reminder: Our weekly team meeting is scheduled for this Friday. Please be prepared to update the team on your weekly progress.
> > > >
> > > > Best,
> > > > Mark

However, I would like to propose that we move the time from 3:00 PM to 1:00 PM to accommodate the marketing team's availability.

> On Tue, Oct 10, 2023 at 4:30 PM, Raj wrote:
>
> > I second Jenna's suggestion but prefer to keep it at the original time since the marketing team has a conflict at that time.

Raj, do you think the marketing team can shuffle their commitments to adjust to this one-off change, or should we consider an alternative time?

Looking forward to hearing everyone's thoughts.

Best,
Amy

# Code block showcase

```javascript
const controller = new AbortController();
const signal = controller.signal;
const url = "video.mp4";

const downloadBtn = document.querySelector("#download");
const abortBtn = document.querySelector("#abort");

downloadBtn.addEventListener("click", async () => {
  try {
    const response = await fetch(url, { signal });
    console.log("Download complete", response);
  } catch (error) {
    console.error(`Download error: ${error.message}`);
  }
});

abortBtn.addEventListener("click", () => {
  controller.abort();
  console.log("Download aborted");
});
```

# Image showcase

![Wet glass with a lot of red and white lights behind](https://raw.githubusercontent.com/tai2/decor/main/content/sample-5.jpg "This is an example image")

![Scenery with green trees and cars passing through](https://raw.githubusercontent.com/tai2/decor/main/content/sample-5s.mp4 "This is an example video")

# Headings showcase

## Markdown

_Markdown_ is a
[lightweight markup language](https://en.wikipedia.org/wiki/Lightweight_markup_language "Link to the
Lightweight markup language on Wikipedia")
for creating formatted text using a plain-text editor. John Gruber created
Markdown in 2004 as a markup language that is easy to read in its source code
form. Markdown is widely used for blogging and instant messaging, and also used
elsewhere in online forums, collaborative software, documentation pages, and
readme files.

The initial description of Markdown contained ambiguities and raised unanswered
questions, causing implementations to both intentionally and accidentally
diverge from the original version. This was addressed in 2014 when long-standing
Markdown contributors released CommonMark, an unambiguous specification and test
suite for Markdown.

### History

Markdown was inspired by pre-existing conventions for marking up plain text in
email and usenet posts, such as the earlier markup languages setext (c. 1992),
Textile (c. 2002), and reStructuredText (c. 2002).

In 2002 Aaron Swartz created atx and referred to it as "the true structured text
format". Gruber created the Markdown language in 2004, with Swartz acting as
beta tester, with the goal of enabling people "to write using an easy-to-read
and easy-to-write plain text format, optionally convert it to structurally valid
XHTML (or HTML)."

Its key design goal was readability, that the language be readable as-is,
without looking like it has been marked up with tags or formatting instructions,
unlike text formatted with 'heavier' markup languages, such as Rich Text Format
(RTF), HTML, or even wikitext (each of which have obvious in-line tags and
formatting instructions which can make the text more difficult for humans to
read).

Gruber wrote a Perl script, `Markdown.pl`, which converts marked-up text input
to valid, well-formed XHTML or HTML and replaces angle brackets (`<`, `>`) and
ampersands (`&`) with their corresponding character entity references. It can
take the role of a standalone script, a plugin for Blosxom or a Movable Type, or
of a text filter for BBEdit.

#### Rise and divergence

As Markdown's popularity grew rapidly, many Markdown implementations appeared,
driven mostly by the need for additional features such as tables, footnotes,
definition lists, and Markdown inside HTML blocks.

The behavior of some of these diverged from the reference implementation, as
Markdown was only characterised by an informal specification and a Perl
implementation for conversion to HTML.

At the same time, a number of ambiguities in the informal specification had
attracted attention. These issues spurred the creation of tools such as
Babelmark to compare the output of various implementations, and an effort by
some developers of Markdown parsers for standardisation. However, Gruber has
argued that complete standardization would be a mistake: "Different sites (and
people) have different needs. No one syntax would make all happy."

Gruber avoided using curly braces in Markdown to unofficially reserve them for
implementation-specific extensions.

##### Standardization

From 2012, a group of people, including Jeff Atwood and John MacFarlane,
launched what Atwood characterised as a standardisation effort. A community
website now aims to "document various tools and resources available to document
authors and developers, as well as implementors of the various Markdown
implementations". In September 2014, Gruber objected to the usage of "Markdown"
in the name of this effort and it was rebranded as CommonMark. CommonMark.org
published several versions of a specification, reference implementation, test
suite, and " to announce a finalized 1.0 spec and test suite in 2019." No 1.0
spec has since been released as major issues still remain unsolved. Nonetheless,
the following websites and projects have adopted CommonMark: Discourse, GitHub,
GitLab, Reddit, Qt, Stack Exchange (Stack Overflow), and Swift.

In March 2016 two relevant informational Internet RFCs were published:

- RFC [7763](https://datatracker.ietf.org/doc/html/rfc7763) introduced MIME type
  text/markdown.
- RFC [7764](https://datatracker.ietf.org/doc/html/rfc7764) discussed and
  registered the variants MultiMarkdown, GitHub Flavored Markdown (GFM), Pandoc,
  and Markdown Extra among others.

###### Variants

Websites like Bitbucket, Diaspora, GitHub, OpenStreetMap, Reddit, SourceForge,
and Stack Exchange use variants of Markdown to make discussions between users
easier.

Depending on implementation, basic inline HTML tags may be supported. Italic
text may be implemented by `_underscores_` and/or `*single-asterisks*`.
