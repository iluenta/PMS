"use client"

import * as React from "react"
import { Button, type ButtonProps } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"

const SIDEBAR_COOKIE_NAME = "sidebar:state"
const SIDEBAR_DEFAULT_STATE = "expanded"
// Keyboard shortcut to toggle sidebar
// `metaKey` is the command key on Mac
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

type SidebarContext = {
  state: "expanded" | "collapsed"
  open: boolean
  setOpen: (open: boolean) => void
  openMobile: boolean
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void
}

const SidebarContext = React.createContext<SidebarContext | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  {
    children: React.ReactNode
    defaultOpen?: boolean
  }
>(function SidebarProvider({ children, defaultOpen }, ref) {
  const [open, setOpen] = React.useState(defaultOpen ?? true)
  const [openMobile, setOpenMobile] = React.useState(false)

  const isMobile = useMobile()

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === SIDEBAR_KEYBOARD_SHORTCUT && e.metaKey) {
        toggleSidebar()
      }
    }
    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  React.useEffect(() => {
    // get cookie
    const cookie = document.cookie
      .split(";")
      .find((c) => c.trim().startsWith(SIDEBAR_COOKIE_NAME + "="))
    if (cookie) {
      const state = cookie.split("=")[1]
      if (state === "collapsed") {
        setOpen(false)
      }
    }
  }, [])

  const toggleSidebar = () => {
    setOpen(!open)
    // set cookie
    document.cookie = `${SIDEBAR_COOKIE_NAME}=${
      !open ? "expanded" : "collapsed"
    }; path=/`
  }

  const state = open ? "expanded" : "collapsed"

  const contextValue = React.useMemo<SidebarContext>(
    () => ({
      state,
      open,
      setOpen,
      isMobile,
      openMobile,
      setOpenMobile,
      toggleSidebar,
    }),
    [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
  )

  return (
    <SidebarContext.Provider value={contextValue}>
      <div ref={ref}>{children}</div>
    </SidebarContext.Provider>
  )
})
SidebarProvider.displayName = "SidebarProvider"

// eslint-disable-next-line react/prop-types
const Sidebar = ({ children }: { children: React.ReactNode }) => {
  const { isMobile } = useSidebar()
  if (isMobile) {
    // On mobile, the sidebar is handled by the Sheet in Layout.tsx
    // so we render nothing here.
    return null
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-10 hidden w-64 flex-col border-r bg-background sm:flex">
      {children}
    </aside>
  )
}
Sidebar.displayName = "Sidebar"

const SidebarTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(function SidebarTrigger(props, ref) {
  const { state, isMobile, toggleSidebar } = useSidebar()

  if (isMobile) return null

  return (
    <button
      onClick={toggleSidebar}
      className="hidden size-7 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-500 hover:bg-zinc-200 hover:text-zinc-700 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700 dark:hover:text-zinc-200 lg:flex"
      ref={ref}
      {...props}
    >
      <ChevronLeftIcon
        className={cn(
          "size-4 transition-transform duration-200",
          state === "collapsed" && "rotate-180"
        )}
      />
    </button>
  )
})
SidebarTrigger.displayName = "SidebarTrigger"

const SidebarHeader = (props: React.HTMLAttributes<HTMLDivElement>) => {
  const { state, isMobile } = useSidebar()

  if (isMobile) return null

  return (
    <div
      className={cn(
        "flex h-16 shrink-0 items-center justify-between border-b px-4",
        state === "collapsed" && "h-auto border-b-0"
      )}
      {...props}
    />
  )
}
SidebarHeader.displayName = "SidebarHeader"

const SidebarTitle = (props: React.HTMLAttributes<HTMLHeadingElement>) => {
  const { state, isMobile } = useSidebar()

  if (isMobile) return null

  if (state === "collapsed") return null

  return <h2 className="text-lg font-semibold" {...props} />
}
SidebarTitle.displayName = "SidebarTitle"

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(function SidebarContent(props, ref) {
  const { open, state, isMobile, openMobile } = useSidebar()
  const { setOpenMobile } = useSidebar()

  if (!open && !isMobile) {
    return (
      <div className={cn("mt-4 flex flex-col items-center gap-1")}>
        {React.Children.map(props.children, (child) => {
          if (React.isValidElement(child)) {
            // @ts-expect-error - i know what im doing
            return React.cloneElement(child, { isCollapsed: true })
          }
          return child
        })}
      </div>
    )
  }

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <div ref={ref} {...props} />
      </Sheet>
    )
  }

  return (
    <div
      className={cn("flex-1 overflow-y-auto", state === "collapsed" && "mt-4")}
      ref={ref}
      {...props}
    />
  )
})
SidebarContent.displayName = "SidebarContent"

const SidebarFooter = (props: React.HTMLAttributes<HTMLDivElement>) => {
  const { state, isMobile } = useSidebar()

  if (isMobile) return null

  return (
    <div
      className={cn(
        "mt-auto flex h-16 shrink-0 items-center justify-between border-t px-4",
        state === "collapsed" && "h-auto flex-col border-t-0 py-2"
      )}
      {...props}
    />
  )
}
SidebarFooter.displayName = "SidebarFooter"

const SidebarItem = React.forwardRef<
  HTMLButtonElement,
  ButtonProps & {
    isCollapsed?: boolean
  }
>(function SidebarItem({ isCollapsed, ...props }, ref) {
  if (isCollapsed) {
    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger>
            <Button
              ref={ref}
              variant="ghost"
              size="icon"
              className="size-9"
              {...props}
            />
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>{props.children}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )
  }

  return <Button ref={ref} variant="ghost" className="w-full" {...props} />
})
SidebarItem.displayName = "SidebarItem"

export {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTitle,
  SidebarTrigger,
  SidebarFooter,
  SidebarItem,
  SidebarProvider,
  useSidebar,
}

function MenuIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <line x1="4" x2="20" y1="12" y2="12" />
      <line x1="4" x2="20" y1="6" y2="6" />
      <line x1="4" x2="20" y1="18" y2="18" />
    </svg>
  )
}

function ChevronLeftIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}
