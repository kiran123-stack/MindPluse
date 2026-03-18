export interface Option {
  label: string;
  score: number;
}

export interface Question {
  id: string;
  text: string;
  options: Option[];
}
const scale = [
  { label: "Not at all", score: 0 },
  { label: "Sometimes", score: 1 },
  { label: "Often", score: 2 },
  { label: "Almost always", score: 3 },
];

const reverseScale = [
  { label: "Strongly agree", score: 0 },
  { label: "Agree", score: 1 },
  { label: "Disagree", score: 2 },
  { label: "Strongly disagree", score: 3 },
];

export const questionBank: Record<string, Question[]> ={
    career_confusion: [
  {
    id: "c1",
    text: "Do you often feel unsure about what career path is right for you?",
    options: scale,
  },
  {
    id: "c2",
    text: "Do you feel anxious when thinking about your future career?",
    options: scale,
  },
  {
    id: "c3",
    text: "Do you keep changing your interests or goals frequently?",
    options: scale,
  },
  {
    id: "c4",
    text: "Do you delay making important career decisions?",
    options: scale,
  },
  {
    id: "c5",
    text: "Do you feel pressure from family or society regarding your career choice?",
    options: scale,
  },
  {
    id: "c6",
    text: "Do you compare your progress with others and feel behind?",
    options: scale,
  },
  {
    id: "c7",
    text: "Do you clearly understand your strengths and skills?",
    options: reverseScale,
  },
  {
    id: "c8",
    text: "Do you feel your current path aligns with your interests?",
    options: reverseScale,
  },
  {
    id: "c9",
    text: "Do you feel lost or directionless in life right now?",
    options: scale,
  },
  {
    id: "c10",
    text: "Do you believe you can build a successful career if you choose the right path?",
    options: reverseScale,
  },
],

job_stress: [
  {
    id: "j1",
    text: "Do you feel overwhelmed by the amount of work you have to do?",
    options: scale,
  },
  {
    id: "j2",
    text: "Do you find it difficult to relax even after work hours?",
    options: scale,
  },
  {
    id: "j3",
    text: "Do you feel mentally exhausted at the end of the day?",
    options: scale,
  },
  {
    id: "j4",
    text: "Do you feel like your work is never truly finished?",
    options: scale,
  },
  {
    id: "j5",
    text: "Do you struggle to maintain a balance between work and personal life?",
    options: scale,
  },
  {
    id: "j6",
    text: "Has your work stress affected your sleep or mood?",
    options: scale,
  },
  {
    id: "j7",
    text: "Do you feel you have control over your workload and responsibilities?",
    options: reverseScale,
  },
  {
    id: "j8",
    text: "Do you feel motivated and satisfied with your work?",
    options: reverseScale,
  },
  {
    id: "j9",
    text: "Do you experience physical symptoms like headaches, fatigue, or tension due to work?",
    options: scale,
  },
  {
    id: "j10",
    text: "Do you feel appreciated or recognized for your efforts at work?",
    options: reverseScale,
  },
],

relationship: [
  {
    id: "r1",
    text: "Do you feel emotionally disconnected from someone important in your life?",
    options: scale,
  },
  {
    id: "r2",
    text: "Do small misunderstandings often turn into arguments?",
    options: scale,
  },
  {
    id: "r3",
    text: "Do you feel unheard or not understood when you express your feelings?",
    options: scale,
  },
  {
    id: "r4",
    text: "Do you find it hard to openly communicate your thoughts or emotions?",
    options: scale,
  },
  {
    id: "r5",
    text: "Do you feel like you are putting more effort into the relationship than the other person?",
    options: scale,
  },
  {
    id: "r6",
    text: "Do you often feel insecure or unsure about where you stand in the relationship?",
    options: scale,
  },
  {
    id: "r7",
    text: "Do you feel valued and appreciated in your relationship?",
    options: reverseScale,
  },
  {
    id: "r8",
    text: "Do you trust the other person fully?",
    options: reverseScale,
  },
  {
    id: "r9",
    text: "Do you feel lonely even when you are with this person?",
    options: scale,
  },
  {
    id: "r10",
    text: "Do you feel emotionally safe sharing your true self in the relationship?",
    options: reverseScale,
  },
],

overthinking: [
  {
    id: "o1",
    text: "Do you find it hard to stop thinking about the same issue repeatedly?",
    options: scale,
  },
  {
    id: "o2",
    text: "Do you often imagine worst-case scenarios in your mind?",
    options: scale,
  },
  {
    id: "o3",
    text: "Do you struggle to make decisions because you keep analyzing every option?",
    options: scale,
  },
  {
    id: "o4",
    text: "Do your thoughts interfere with your ability to focus on tasks?",
    options: scale,
  },
  {
    id: "o5",
    text: "Do you replay past situations and think about what you could have done differently?",
    options: scale,
  },
  {
    id: "o6",
    text: "Do you feel mentally exhausted due to constant thinking?",
    options: scale,
  },
  {
    id: "o7",
    text: "Do you feel in control of your thoughts most of the time?",
    options: reverseScale,
  },
  {
    id: "o8",
    text: "Do you find it easy to let go of thoughts once they appear?",
    options: reverseScale,
  },
  {
    id: "o9",
    text: "Do you feel anxious about things that haven’t even happened yet?",
    options: scale,
  },
  {
    id: "o10",
    text: "Do you believe your thinking helps you solve problems effectively?",
    options: reverseScale,
  },
],

low_motivation: [
  {
    id: "m1",
    text: "Do you find it difficult to start tasks even when they are important?",
    options: scale,
  },
  {
    id: "m2",
    text: "Do you often feel low on energy throughout the day?",
    options: scale,
  },
  {
    id: "m3",
    text: "Do you delay or avoid tasks even when you know the consequences?",
    options: scale,
  },
  {
    id: "m4",
    text: "Do you feel like you’ve lost interest in things you once enjoyed?",
    options: scale,
  },
  {
    id: "m5",
    text: "Do you feel a lack of purpose or direction in your life?",
    options: scale,
  },
  {
    id: "m6",
    text: "Do you feel mentally drained even without doing much work?",
    options: scale,
  },
  {
    id: "m7",
    text: "Do you feel confident in your ability to achieve your goals?",
    options: reverseScale,
  },
  {
    id: "m8",
    text: "Do you feel excited or driven about your future?",
    options: reverseScale,
  },
  {
    id: "m9",
    text: "Do you rely heavily on mood or motivation to get things done?",
    options: scale,
  },
  {
    id: "m10",
    text: "Do you feel satisfied after completing tasks or achieving small goals?",
    options: reverseScale,
  },
],

need_to_talk: [
  {
    id: "t1",
    text: "Do you feel like you don’t have someone you can openly talk to?",
    options: scale,
  },
  {
    id: "t2",
    text: "Do you keep your thoughts and emotions to yourself most of the time?",
    options: scale,
  },
  {
    id: "t3",
    text: "Do you feel emotionally overwhelmed but unable to express it?",
    options: scale,
  },
  {
    id: "t4",
    text: "Do you feel like people don’t truly understand what you’re going through?",
    options: scale,
  },
  {
    id: "t5",
    text: "Do you hesitate to share your feelings because of fear of judgment?",
    options: scale,
  },
  {
    id: "t6",
    text: "Do you feel a strong urge to talk but don’t know where to start?",
    options: scale,
  },
  {
    id: "t7",
    text: "Do you feel comfortable expressing your true thoughts to someone?",
    options: reverseScale,
  },
  {
    id: "t8",
    text: "Do you feel heard and understood when you talk to others?",
    options: reverseScale,
  },
  {
    id: "t9",
    text: "Do you feel lonely even when surrounded by people?",
    options: scale,
  },
  {
    id: "t10",
    text: "Do you feel better after expressing your thoughts or emotions?",
    options: reverseScale,
  },
],
}