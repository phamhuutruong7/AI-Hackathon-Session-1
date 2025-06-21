import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
`;

const PageTitle = styled.h1`
  color: #333;
  margin-bottom: 2rem;
`;

const PlaceholderCard = styled.div`
  background: white;
  padding: 3rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const PlaceholderText = styled.p`
  color: #666;
  font-size: 1.1rem;
  margin-bottom: 1rem;
`;

const TemplatesPage: React.FC = () => {
  return (
    <Container>
      <PageTitle>Email Templates</PageTitle>
      <PlaceholderCard>
        <PlaceholderText>📧</PlaceholderText>
        <PlaceholderText>Template management functionality will be implemented here.</PlaceholderText>
        <PlaceholderText>Features to include:</PlaceholderText>
        <ul style={{ textAlign: 'left', maxWidth: '400px', margin: '0 auto' }}>
          <li>View all email templates</li>
          <li>Create new templates</li>
          <li>Edit existing templates</li>
          <li>Delete templates</li>
          <li>Filter by purpose and language</li>
        </ul>
      </PlaceholderCard>
    </Container>
  );
};

export default TemplatesPage;
