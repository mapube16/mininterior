// El kit GOV.CO viene compilado como IIFE que lee `window.React` y escribe en
// `window.DesignSystem_0b54b8`. En vez de reescribir sus 24 componentes, le damos
// los globales que espera y reexportamos lo que deja.
// ponytail: shim en vez de port; si el kit se publica como paquete npm, esto se borra.
import React from 'react'
import './styles.css'

window.React = React
await import('./_ds_bundle.js')

const kit = window.DesignSystem_0b54b8

if (kit.__errors?.length) {
  console.error('Componentes del kit que no cargaron:', kit.__errors)
}

export const {
  AccessibilityBar,
  Accordion,
  BackToTop,
  Banner,
  Breadcrumb,
  Button,
  Checkbox,
  DataTable,
  Footer,
  Header,
  InfoCard,
  Modal,
  Notification,
  Pagination,
  ProgressBar,
  ProgressSteps,
  Radio,
  RadioGroup,
  SearchBar,
  Select,
  Spinner,
  Tabs,
  Tag,
  TextField,
  Tooltip,
  TopBar,
} = kit
