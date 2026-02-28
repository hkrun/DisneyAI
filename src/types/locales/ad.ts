export interface Ad {
  close: string
  open: string
  ad: string
  /** 弹窗底部提示文案前半段，如「点击图片」 */
  openButtonBefore?: string
  /** 弹窗底部提示文案高亮词，如「打开」 */
  openButtonHighlight?: string
  /** 弹窗底部提示文案后半段，如「链接」 */
  openButtonAfter?: string
}
