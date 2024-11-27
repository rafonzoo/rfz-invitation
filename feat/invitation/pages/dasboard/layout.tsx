import { getCheckUser } from '@/feat/auth/action'
import Sidebar from '@/components/navigation/sidebar'
import Main from '@/components/layout/main'
import TabBar from '@/components/navigation/tabbar'

type Page = RC & {
  params: {
    slug: string[]
  }
}

export default async function InvitationDashboardLayout({ children }: Page) {
  const user = await getCheckUser()

  return (
    <div className='flex min-h-screen bg-zinc-100 supports-[min-height:_100lvh]:min-h-[100lvh] md-max:flex-col dark:bg-black'>
      <Sidebar>
        <div className='h-6 w-10'></div>
      </Sidebar>
      <Main user={user}>{children}</Main>
      <TabBar />
    </div>
  )
}