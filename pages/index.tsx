import Link from "next/link"
import path from "path"
import fs from "fs"
import matter from "gray-matter"

import { InferGetStaticPropsType } from "next"

import Container from "@/components/Container"

const Index = ({
  /*paths = []*/ links = [],
}: InferGetStaticPropsType<typeof getStaticProps>): JSX.Element => {
  let sortedLinks = links
    .slice()
    .sort((a, b) => (new Date(a.dateCreated) < new Date(b.dateCreated) ? 1 : -1))

  return (
    <Container>
      <div tw="h-full mx-auto max-w-prose">
        <h1 tw="text-4xl">Welcome to a blog!</h1>
        {/*paths.length ? (
          <ul tw="list-none">
            {paths.map(path => (
              <li tw="block" key={path.toString()}>
                <Link href={"/blog/" + path}>{path}</Link>
              </li>
            ))}
          </ul>
            ) : null*/}
        {sortedLinks.length ? (
          <ul tw="list-none">
            {sortedLinks.map(link => (
              <li tw="block" key={link.title.toString()}>
                <Link href={"/blog/" + link.slug}>{link.title}</Link>
                <div>{new Date(link.dateCreated).toDateString()}</div>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </Container>
  )
}

export const getStaticProps = async () => {
  const postsDirectory = path.join(process.cwd(), "_mdx_")
  const filenames = fs.readdirSync(postsDirectory)

  const links = filenames
    .map(path => {
      if (fs.existsSync(`${process.cwd()}/_mdx_/${path}/index.mdx`)) {
        const rawContents = fs.readFileSync(`${process.cwd()}/_mdx_/${path}/index.mdx`, "utf8")
        const { data: meta } = matter(rawContents)
        // TODO remove the slug fields from matter, the dirs will be the only source of true.
        return { ...meta, slug: path }
      }
    })
    .filter(Boolean)

  return {
    props: {
      //paths,
      links,
    },
  }
}

export default Index
