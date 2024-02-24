import { baseParse } from './parse'
export function baseCompile(template: string) {
  // 1.先把 template parse 成 ast 
  const ast: any = baseParse(template)

  // 2.给ast树添加属性

  // 3.转成render函数
}
// baseCompile('<img />')             
baseCompile('<div><p></p>{{message}}</div>')             