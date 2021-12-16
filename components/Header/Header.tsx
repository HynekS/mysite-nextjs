import Link from "next/link"

import { ThemeToggle } from "../Theme"

const Header = (): JSX.Element => {
  return (
    <header tw="flex justify-between p-4 pr-6">
      <Link href="/">
        <a>HynekS</a>
      </Link>

      <ThemeToggle />
    </header>
  )
}

export default Header
