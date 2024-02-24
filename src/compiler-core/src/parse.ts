import { NodeTypes } from './ast'
const interpolationOpenDelimiter = '{{'
const interpolationCloseDelimiter = '}}'

const ElementCloseDelimiter = '<'

const enum TagType {
  Start,
  End,
}
export const baseParse = (content: string) => {
  const context = createparserContent(content)
  // 初始化的时候 标签数组 传递一个 []
  return createRoot(parserChildren(context, []))
}
const parserChildren = (context: { source: string }, ancestors) => {
  const nodes: any = []
  // 循环解析 字符串。
  while (!isEnd(context, ancestors)) {
    let node
    const source = context.source

    // 字符串是以 {{ 开头的才需要处理
    if (source.startsWith(interpolationOpenDelimiter)) {
      // 插值
      node = parseInterpolation(context)
    } else if (source.startsWith(ElementCloseDelimiter)) { // source[0] === '<'
      // element
      if (/[a-z]/i.test(source[1])) {
        node = parserElement(context, ancestors)
      }
    }

    // 如果前面的的两个判断都没有命中，表示是文本。
    if (!node) {
      node = parseText(context)
    }
    nodes.push(node)
  }

  return nodes
}
function parseText(context: any) {
  let endIndex = context.source.length;
  // 碰到这里表示文本结束
  const endTokens = ["<", "{{"];
  for (let i = 0; i < endTokens.length; i++) {
    const idx = context.source.indexOf(endTokens[i]);
    if (idx !== -1 && idx < endIndex) {
      endIndex = idx;
    }
  }
  const content = parseTextData(context, endIndex);
  return {
    type: NodeTypes.TEXT,
    content,
  };
}
const isEnd = (context, ancestors) => {
  // 1.当遇到结束标签的时候
  const source = context.source
  if (source.startsWith('</')) {
    for (let i = ancestors.length - 1; i >= 0; i--) {
      const tag = ancestors[i].tag
      if (startWithEndTagOpen(source, tag)) {
        return true
      }
    }
  }

  // 2.context.source 有值的时候
  return !context.source
}
function startWithEndTagOpen(source, tag) {
  return (
    source.startsWith("</") &&
    source.slice(2, 2 + tag.length).toLowerCase() === tag.toLowerCase()
  );
}
function parserElement(context: any, ancestors) {
  // 1. 解析 tag   2.删除处理完成的string
  const element: any = parseTag(context, TagType.Start);
  ancestors.push(element);
  element.children = parserChildren(context, ancestors);
  // 当闭合一个标签之后 ancestors去除最后一个tag
  ancestors.pop();
  if (startWithEndTagOpen(context.source, element.tag)) {
    parseTag(context, TagType.End);
  } else {
    throw new Error(`缺少结束标签:${element.tag}`);
  }
  return element;
}

function parseTag(context: any, tagType) {
  const match: any = /^<\/?([a-z]*[0-9]?)/i.exec(context.source);
  const tag = match[1];
  advanceBy(context, match[0].length);
  advanceBy(context, 1);
  if (tagType === TagType.End) return;
  return {
    type: NodeTypes.ELEMENT,
    tag,
  };
}
const advanceBy = (context, length) => {
  context.source = context.source.slice(length)
}
const parseTextData = (context: any, length) => {
  const content = context.source.slice(0, length)
  // 2. 推进
  advanceBy(context, length)

  return content
}
// 插值
const parseInterpolation = (context) => {
  // {{ message }} ---> 拿到这个 message

  // 从第二个字符位置开始查找， 到 '}}' 结束
  const closeIndex = context.source.indexOf(interpolationCloseDelimiter, interpolationOpenDelimiter.length)
  //  1.切 {{ 去掉 前面的 '{{'
  advanceBy(context, interpolationOpenDelimiter.length)

  const rawContentLength = closeIndex - interpolationOpenDelimiter.length
  // 2.切 }}之前的 xxxx}} 可能存在空格 trim去掉~
  const rawContent = parseTextData(context, rawContentLength)
  const content = rawContent.trim()
  // 3.切 }}
  advanceBy(context, interpolationCloseDelimiter.length)


  return {
    type: NodeTypes.INTERPOLATION,
    content: {
      type: NodeTypes.SIMPLE_EXPRESSION,
      content
    }
  }
}
const createRoot = (children) => {
  return {
    children,
    type: NodeTypes.ROOT
  }
}
const createparserContent = (content: string) => {
  return {
    source: content
  }
}