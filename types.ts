
export enum Step {
  Welcome = 'welcome',
  Input = 'input',
  Drawing = 'drawing',
  DrawResult = 'draw_result',
  Bwei = 'bwei',
  Result = 'result',
  History = 'history'
}

export interface UserInfo {
  name: string;
  birthday: string;
  address: string;
  quest: string;
}

export interface Poem {
  id: number;
  title: string;
  content: string; // The 4 sentences
  advice: string; // 聖意
  explanation: string; // 中文解析
}

export interface DivinationRecord {
  id: number;
  timestamp: string;
  userInfo: UserInfo;
  poem: Poem;
}

export type BweiResult = 'sheng' | 'xiao' | 'yin' | 'standing' | null;
