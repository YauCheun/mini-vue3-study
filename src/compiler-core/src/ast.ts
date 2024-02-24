import { CREATE_ELEMENT_VNODE } from './runtimeHelpers'

const enum NodeTypes {
  INTERPOLATION, // 表达式
  SIMPLE_EXPRESSION,  
  ELEMENT,  //标签
  TEXT,       //文本
  ROOT,     //根节点
  COMPOUND_EXPRESSION
}

const createVNodeCall = (context, tag, props, children) => {
  context.helper(CREATE_ELEMENT_VNODE)
  return {
    type: NodeTypes.ELEMENT,
    tag,
    props,
    children
  }
}

export {
	NodeTypes,
  createVNodeCall
}
