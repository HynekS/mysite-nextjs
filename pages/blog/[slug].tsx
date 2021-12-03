import React, { useEffect, useState, useRef } from "react"
import { serialize } from "next-mdx-remote/serialize"

import { MDXRemote } from "next-mdx-remote"
// @ts-ignore
import { preToCodeBlock } from "mdx-utils"
import { onlyText } from "react-children-utilities"

import path from "path"
import fs from "fs"
import slugify from "slugify"

import HighlightedCode from "@/components/HighlightedCode"
import Container from "@/components/Container"
import RecursiveList from "@/components/RecursiveList"
import useObserveActiveSection from "@/hooks/useObserveActiveSection"

import type { ReactNode } from "react"
import type { MDXRemoteSerializeResult } from "next-mdx-remote"
import type { GetStaticPropsContext } from "next"

export function getTableOfContents(content: string) {
  const regexp = new RegExp(/(#{2,6} )(.+?)(?=\r\n)/, "gm")
  const headings = [...content.matchAll(regexp)]

  let tableOfContents = headings.length
    ? headings.map(heading => {
        const headingText = heading[2].trim()
        const headingType = heading[1].trim().length
        const headingLink = slugify(headingText, { lower: true, strict: true })

        return {
          title: headingText,
          slug: headingLink,
          level: headingType,
        }
      })
    : []

  const headingsOffset = tableOfContents[0] && tableOfContents[0].level - 1

  const WithadjustedLevels = headingsOffset
    ? tableOfContents.map(heading => ({
        ...heading,
        level: heading.level - headingsOffset,
      }))
    : []

  type Node = {
    nodes?: undefined | Node[]
    title?: string
    slug?: string
    level?: number
  }

  function buildTree(array: typeof WithadjustedLevels) {
    let levels: Node[] = [{ nodes: undefined }]
    array.forEach(function (a) {
      levels.length = a.level
      levels[a.level - 1].nodes = levels[a.level - 1].nodes || []
      levels[a.level - 1].nodes?.push(a)
      levels[a.level] = a
    })

    return levels[0].nodes
  }

  return buildTree(WithadjustedLevels)
}

const useImage = (fileName: string, slug: string) => {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<null | string>(null)
  const [image, setImage] = useState<undefined | string>()

  useEffect(() => {
    const fetchImage = async () => {
      try {
        const response = await import(`../../_mdx_/${slug}/${fileName}`)

        let img = new window.Image()
        img.src = response.default
        img.onload = () => {
          console.log("loaded")
          console.log({ img })
        }
        img.onerror = () => {
          console.log("error")
        }

        setImage(response.default)
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }

    fetchImage()
  }, [fileName])

  return {
    loading,
    error,
    image,
  }
}

type ImageProps = {
  fileName: string
  alt: string
  slug: string
}

const Image = ({ fileName, alt, slug }: ImageProps) => {
  let src = require(`../../_mdx_/${slug}/${fileName}`)

  return <img src={src} alt={alt} />
  /*
  const { loading, error, image } = useImage(fileName, slug)

  switch (true) {
    case Boolean(image):
      return <img src={image} alt={alt} />
    case Boolean(error):
      return <div style={{ backgroundColor: "red" }}>{error}</div>
    default:
      return <>loading…</>
  }*/
}

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6"

const headings = ["h1", "h2", "h3", "h4", "h5", "h6"].map(headingTag => [
  headingTag,
  ({ children }: { children: ReactNode }) => {
    const idText = slugify(onlyText(children), { lower: true, strict: true })
    const Tag = headingTag as HeadingTag

    return <Tag id={idText}>{children}</Tag>
  },
])

type Components = {
  [component: string]: () => JSX.Element
}

type ImgProps = {
  src: string
  alt: string
}

type PreProps = {
  children?: ReactNode
}

const components = (slug: string): Components => ({
  ...Object.fromEntries(headings),

  pre: (preProps: PreProps) => {
    const props = preToCodeBlock(preProps)

    if (props) {
      return <HighlightedCode {...props} />
    } else {
      return <pre {...preProps} />
    }
  },

  img: ({ src, alt = "" }: ImgProps) => {
    return <Image fileName={src} alt={alt} slug={slug} />
  },
})

type PostProps = {
  source: MDXRemoteSerializeResult
  slug: string
  contents: string
}

export default function Post({ source, slug, contents }: PostProps) {
  const articleRef = useRef<HTMLDivElement>(null!)
  const navRef = useRef<HTMLDivElement>(null!)

  useObserveActiveSection(navRef, articleRef)
  let toc = getTableOfContents(contents)

  return (
    <Container>
      {toc ? <RecursiveList tree={toc} ref={navRef}></RecursiveList> : null}
      <article
        ref={articleRef}
        tw="prose prose-sm mx-auto pt-8 px-4 md:(prose) lg:(prose-lg px-0) dark:(prose-dark)"
      >
        <MDXRemote {...source} components={components(slug)} />
      </article>
    </Container>
  )
}

export const getStaticProps = async (context: GetStaticPropsContext<{ slug: string }>) => {
  const slug = context.params?.slug
  const filePath = path.join(process.cwd(), `_mdx_/${slug}/index.mdx`)
  const contents = fs.readFileSync(filePath, "utf8")

  const source = contents
  const mdxSource = await serialize(source, {
    mdxOptions: {},
  })

  return { props: { source: mdxSource, slug, contents } }
}

export const getStaticPaths = async () => {
  const postsDirectory = path.join(process.cwd(), "_mdx_")
  const filenames = fs.readdirSync(postsDirectory)

  const paths = filenames.map(path => {
    const slug = path.split(".")[0]

    return {
      params: {
        slug,
      },
    }
  })

  return {
    paths,
    fallback: false,
  }
}
