import { extendTheme } from '@chakra-ui/core'
import { transparentize } from '@chakra-ui/theme-tools'

export default extendTheme({
  fonts: {
    heading: 'Spartan, sans-serif',
    body: 'Spartan, sans-serif',
    mono: 'monospace',
  },
  fontSizes: {
    xs: '12px',
    sm: '14px',
    md: '16px',
    lg: '18px',
    xl: '21px',
    xxl: '24px',
  },
  fontWeights: {
    normal: 500,
    medium: 500,
    bold: 700,
  },
  colors: {
    lightBlue: '#F2F9FB',
    blue: '#34408C',
    fadedBlue: '#ABBDEB',
    grayBlue: '#AFB5D9',
    darkBlue: '#212946',
    brightBlue: '#3C8FDB',
    brightRed: '#ED5454',
  },
  styles: {
    global: {
      body: {
        bg: 'lightBlue',
        color: 'blue',
        WebkitTapHighlightColor: 'transparent',
      },
      'html, body': {
        position: 'fixed',
      },
      'html, body, #root': {
        width: '100%',
        height: '100%',
        display: 'flex',
      },
    },
  },
  layerStyles: {
    formScreenInput: {
      display: 'block',
      maxW: '18rem',
      mx: 'auto',
    },
  },
  components: {
    Heading: {
      sizes: {
        md: {
          fontSize: 'lg',
        },
      },
    },
    Button: {
      baseStyle: {
        color: 'lightBlue',
        borderRadius: 'full',
        fontWeight: 'normal',
        _disabled: {
          opacity: 0.2,
        },
      },
      defaultProps: {
        colorScheme: 'blue',
      },
      variants: {
        solid: ({ colorScheme }) => ({
          bg: colorScheme,
          _hover: {
            bg: transparentize(colorScheme, 0.76),
          },
          _active: {
            bg: transparentize(colorScheme, 0.85),
          },
        }),
        faint: ({ colorScheme }: { colorScheme: string }) => ({
          bg: transparentize(colorScheme, 0.3),
          _hover: {
            bg: transparentize(colorScheme, 0.45),
          },
          _active: {
            bg: transparentize(colorScheme, 0.4),
          },
        }),
        outline: {
          borderColor: 'blue',
          fontWeight: 'normal',
          _checked: { bg: transparentize('fadedBlue', 0.5) },
          _hover: {
            bg: transparentize('fadedBlue', 0.3),
          },
        },
        link: {
          color: 'blue',
          fontWeight: 'normal',
          textDecoration: 'underline',
        },
      },
      sizes: {
        lg: {
          h: [10, 12],
          w: ['18rem', '24rem'],
          fontSize: ['lg', 'xxl'],
          fontWeight: 'bold',
          px: 6,
        },
        'lg-light': {
          h: [10, 12],
          w: ['18rem', '24rem'],
          fontSize: ['sm', 'md'],
          fontWeight: 'normal',
          px: 6,
        },
        md: {
          h: 8,
          fontSize: 'sm',
        },
        sm: {
          fontSize: 'sm',
        },
      },
    },
    Progress: {
      baseStyle: {
        filledTrack: {
          bg: 'brightBlue',
          transition: 'all 200ms ease-out',
        },
        track: {
          bg: 'brightRed',
          transition: 'all 200ms ease-out',
        },
      },
    },
    FormLabel: {
      baseStyle: {
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: ['md', 'lg'],
      },
    },
    Input: {
      baseStyle: {
        field: {
          textAlign: 'center',
        },
      },
      variants: {
        outline: {
          field: {
            bg: 'white',
            _invalid: {
              borderColor: 'inherit',
              boxShadow: 'none',
            },
          },
        },
      },
    },
    Textarea: {
      baseStyle: {
        minH: '50px',
      },
      variants: {
        outline: {
          bg: 'white',
        },
      },
    },
    Select: {
      baseStyle: {
        field: {
          textAlign: 'center',
          textAlignLast: 'center',
        },
      },
      variants: {
        outline: {
          field: {
            bg: 'white',
            _invalid: {
              borderColor: 'inherit',
              boxShadow: 'none',
            },
          },
        },
      },
    },
    Form: {
      baseStyle: {
        errorText: {
          display: 'block',
          textAlign: 'center',
          color: 'brightRed',
        },
      },
    },
    Modal: {
      defaultProps: {
        size: 'xs',
        isCentered: true,
      },
      baseStyle: {
        content: {
          borderRadius: 'none',
          bg: 'lightBlue',
          px: 2,
          py: 4,
        },
        footer: {
          alignItems: 'stretch',
        },
      },
    },
  },
})
