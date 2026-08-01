import React from 'react';
import InsightView from './InsightView.jsx';
import { useMember } from '../memberContext.jsx';

export default function AiAssessment() {
  const { member } = useMember();
  return <InsightView data={member} />;
}
