import { Button } from '@statisticsnorway/ssb-component-library'

const CookieBanner = () => {
  return (
    <div>
      <Button>First Button</Button>
      <Button>Second Button</Button>
    </div>
  )
}

export default (props: object) => <CookieBanner {...props} />
