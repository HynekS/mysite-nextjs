import Link from "next/link"
import path from "path"
import fs from "fs"
import matter from "gray-matter"

import { InferGetStaticPropsType } from "next"

import type { Meta } from "../pages/blog/[slug]"

import Container from "@/components/Container"

const Index = ({ links = [] }: InferGetStaticPropsType<typeof getStaticProps>): JSX.Element => {
  let sortedLinks = links
    .slice()
    .sort((a, b) => (new Date(String(a.dateCreated)) < new Date(String(b.dateCreated)) ? 1 : -1))

  return (
    <Container>
      <div tw="h-full mx-auto max-w-prose">
        <h1 tw="text-4xl">Welcome to a blog!</h1>
        {sortedLinks.length ? (
          <ul tw="list-none">
            {sortedLinks.map(link => (
              <li tw="block" key={link.title}>
                <Link href={"/blog/" + link.slug}>{link.title}</Link>
                <div>{new Date(String(link.dateCreated)).toDateString()}</div>
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
    .filter(path => fs.existsSync(`${process.cwd()}/_mdx_/${path}/index.mdx`))
    .map(path => {
      const rawContents = fs.readFileSync(`${process.cwd()}/_mdx_/${path}/index.mdx`, "utf8")
      const { data: meta }: { data: Meta } = matter(rawContents)
      return { ...meta, slug: path }
    })

  return {
    props: {
      links,
    },
  }
}

export default Index
