import type { Meta, StoryObj } from '@storybook/react-vite'

import { Icon, type IconName } from './Icon'
import styles from './Icon.stories.module.css'

const iconNames: IconName[] = [
  'plus',
  'close',
  'calendar',
  'mapPin',
  'chevronDown',
  'thumbUp',
  'thumbDown',
  'arrowRight',
]

const meta = {
  title: 'Shared/Icon',
  component: Icon,
  parameters: {
    layout: 'centered',
  },
} satisfies Meta<typeof Icon>

export default meta
type Story = StoryObj<typeof meta>

export const All: Story = {
  args: {
    name: 'plus',
  },
  render: () => (
    <div className={styles.grid}>
      {iconNames.map((name) => (
        <div className={styles.item} key={name}>
          <Icon name={name} />
          <span className={styles.name}>{name}</span>
        </div>
      ))}
    </div>
  ),
}
