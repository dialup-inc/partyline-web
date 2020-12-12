import React from 'react'
import { Story } from '@storybook/react'

import UnsupportedBrowserScreen, {
  UnsupportedBrowserScreenProps,
} from './UnsupportedBrowserScreen'

export default {
  title: 'Screen/Unsupported Browser Screen',
  component: UnsupportedBrowserScreen,
}

const Template: Story<UnsupportedBrowserScreenProps> = (args) => (
  <UnsupportedBrowserScreen {...args} />
)

export const iphone = Template.bind({})
iphone.args = {
  onPressCopy: async () => {},
  isIOS: true,
}

export const desktop = Template.bind({})
desktop.args = {
  ...iphone.args,
  isIOS: false,
}
