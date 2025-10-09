import React, { useState } from 'react'
import {
  StyledButton,
  StyledInput,
  StyledCard,
  ModalOverlay,
  ModalContent,
  Heading,
  SubHeading,
  Text,
  FlexRow,
  FlexColumn,
  Grid
} from '../styles/StyledComponents'

// Example component showing how to use styled-components
export const StyledExamples: React.FC = () => {
  const [showModal, setShowModal] = useState(false)
  const [inputValue, setInputValue] = useState('')

  return (
    <FlexColumn>
      <Heading>Styled Components Examples</Heading>
      
      {/* Button Examples */}
      <StyledCard>
        <SubHeading>Button Variants</SubHeading>
        <FlexRow>
          <StyledButton variant="primary" size="sm">
            Primary Small
          </StyledButton>
          <StyledButton variant="secondary" size="md">
            Secondary Medium
          </StyledButton>
          <StyledButton variant="tertiary" size="lg">
            Tertiary Large
          </StyledButton>
          <StyledButton variant="ghost">
            Ghost Button
          </StyledButton>
        </FlexRow>
        
        <FlexRow style={{ marginTop: '1rem' }}>
          <StyledButton fullWidth variant="primary">
            Full Width Primary
          </StyledButton>
        </FlexRow>
        
        <FlexRow style={{ marginTop: '1rem' }}>
          <StyledButton disabled>
            Disabled Button
          </StyledButton>
          <StyledButton 
            variant="primary" 
            onClick={() => setShowModal(true)}
          >
            Open Modal
          </StyledButton>
        </FlexRow>
      </StyledCard>

      {/* Input Examples */}
      <StyledCard>
        <SubHeading>Input Components</SubHeading>
        <FlexColumn>
          <StyledInput
            placeholder="Enter some text..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          <Text>Current value: {inputValue || 'None'}</Text>
        </FlexColumn>
      </StyledCard>

      {/* Grid Example */}
      <StyledCard>
        <SubHeading>Grid Layout</SubHeading>
        <Grid columns={3} gap="1rem">
          <StyledCard style={{ padding: '1rem' }}>
            <Text style={{ margin: 0 }}>Grid Item 1</Text>
          </StyledCard>
          <StyledCard style={{ padding: '1rem' }}>
            <Text style={{ margin: 0 }}>Grid Item 2</Text>
          </StyledCard>
          <StyledCard style={{ padding: '1rem' }}>
            <Text style={{ margin: 0 }}>Grid Item 3</Text>
          </StyledCard>
        </Grid>
      </StyledCard>

      {/* Modal Example */}
      {showModal && (
        <ModalOverlay onClick={() => setShowModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <Heading>Example Modal</Heading>
            <Text>
              This is an example modal using styled-components. It uses the same
              sage green theme as your existing CSS variables.
            </Text>
            <FlexRow style={{ justifyContent: 'flex-end', marginTop: '2rem' }}>
              <StyledButton 
                variant="secondary" 
                onClick={() => setShowModal(false)}
              >
                Cancel
              </StyledButton>
              <StyledButton 
                variant="primary" 
                onClick={() => setShowModal(false)}
              >
                Confirm
              </StyledButton>
            </FlexRow>
          </ModalContent>
        </ModalOverlay>
      )}
    </FlexColumn>
  )
}

export default StyledExamples
