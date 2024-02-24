import { baseParse } from './parse'
export function baseCompile(template: any) {
  console.log(121212,template)
  const ast: any = baseParse()
}
baseCompile(11)             