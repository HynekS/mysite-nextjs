import Link from "next/link"
import path from "path"
import fs from "fs"

import { GetStaticProps } from "next"

import Container from "@/components/Container"

const Index = ({ paths = [] }): JSX.Element => {
  console.log({ paths })

  return (
    <Container>
      <div tw="h-full mx-auto max-w-prose">
        <h1 tw="text-4xl">Welcome to a blog!</h1>
        {paths.length ? (
          <ul tw="list-none">
            {paths.map(path => (
              <li tw="block" key={path.toString()}>
                <Link href={"/blog/" + path}>{path}</Link>
              </li>
            ))}
          </ul>
        ) : null}
        <Link href="/about" as={`/about`}>
          <a>About Me</a>
        </Link>
      </div>
    </Container>
  )
}

export const getStaticProps: GetStaticProps = async () => {
  const postsDirectory = path.join(process.cwd(), "_mdx_")
  const filenames = fs.readdirSync(postsDirectory)

  const paths = filenames.map(path => {
    const slug = path.split(".")[0]

    return slug
  })

  return {
    props: {
      paths,
    },
  }
}

export default Index
