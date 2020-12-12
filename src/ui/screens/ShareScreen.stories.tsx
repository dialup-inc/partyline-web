import React from 'react'
import { Story } from '@storybook/react'

import ShareScreen, { ShareScreenProps } from './ShareScreen'

export default {
  title: 'Screen/Share Screen',
  component: ShareScreen,
}

const Template: Story<ShareScreenProps> = (args) => <ShareScreen {...args} />

export const share = Template.bind({})
share.args = {}

export const shareModal = Template.bind({})
shareModal.args = {
  isModalOpen: true,
}
