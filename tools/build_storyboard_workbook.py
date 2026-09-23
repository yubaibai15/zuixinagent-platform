from pathlib import Path
from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.worksheet.dimensions import ColumnDimension


OUTPUT = Path(__file__).resolve().parents[1] / 'downloads' / '圣灵节专场营销-短视频分镜脚本.xlsx'


def add_title(ws, title, subtitle, last_column):
    ws.merge_cells(start_row=1, start_column=1, end_row=1, end_column=last_column)
    ws['A1'] = title
    ws['A1'].font = Font(name='Microsoft YaHei', size=18, bold=True, color='FFFFFF')
    ws['A1'].fill = PatternFill('solid', fgColor='087653')
    ws['A1'].alignment = Alignment(horizontal='left', vertical='center')
    ws.row_dimensions[1].height = 30
    ws.merge_cells(start_row=2, start_column=1, end_row=2, end_column=last_column)
    ws['A2'] = subtitle
    ws['A2'].font = Font(name='Microsoft YaHei', size=10, color='5E7168')
    ws['A2'].alignment = Alignment(horizontal='left', vertical='center')
    ws.row_dimensions[2].height = 22


def style_table(ws, start_row, end_row, end_column):
    header_fill = PatternFill('solid', fgColor='DDF1E5')
    body_fill = PatternFill('solid', fgColor='F8FCF9')
    border = Border(
        left=Side(style='thin', color='D6E7DC'),
        right=Side(style='thin', color='D6E7DC'),
        top=Side(style='thin', color='D6E7DC'),
        bottom=Side(style='thin', color='D6E7DC'),
    )
    for cell in ws[start_row]:
        cell.font = Font(name='Microsoft YaHei', size=10, bold=True, color='15503B')
        cell.fill = header_fill
        cell.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True)
        cell.border = border
    ws.row_dimensions[start_row].height = 30
    for row in ws.iter_rows(min_row=start_row + 1, max_row=end_row, min_col=1, max_col=end_column):
        for cell in row:
            cell.font = Font(name='Microsoft YaHei', size=10, color='263C33')
            cell.fill = body_fill
            cell.alignment = Alignment(vertical='top', wrap_text=True)
            cell.border = border
        ws.row_dimensions[row[0].row].height = 54


def build_workbook():
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    wb = Workbook()
    ws = wb.active
    ws.title = '短视频分镜'
    ws.sheet_view.showGridLines = False
    ws.freeze_panes = 'A4'
    add_title(ws, '圣灵节专场营销短视频分镜脚本', '交付内容：60 秒品牌短视频分镜、旁白、音效与执行备注。可直接用于拍摄、剪辑和审核。', 9)

    headers = ['序号', '时长', '画面 / 镜头', '景别 / 运镜', '画面文案', '旁白 / 口播', '音乐 / 音效', '所需素材', '执行备注']
    ws.append(headers)
    rows = [
        [1, '0–3秒', '深色背景中出现节庆光线，品牌标识由光点汇聚呈现。', '特写；快速推近', '圣灵节专场', '这个圣灵节，把心动开进生活。', '轻快节拍起；光点聚合声', '品牌标识、节庆粒子动画', '首帧需高对比，确保停留。'],
        [2, '3–8秒', '主视觉产品从城市街景驶入明亮节庆空间。', '全景转中景；平移跟拍', '限时专享礼遇', '一份为热爱准备的节日礼遇，现已开启。', '节拍增强；车辆掠过声', '产品主视觉、城市道路素材', '产品占画面中心，留出字幕安全区。'],
        [3, '8–13秒', '细节切换：灯光、座舱、智能屏幕和质感材质。', '特写组接；节奏剪辑', '智能体验 焕新出发', '每一次出发，都更懂你的期待。', '细腻提示音', '产品细节、座舱交互素材', '每个镜头 1 秒左右，匹配节拍。'],
        [4, '13–19秒', '人物与家人进入节庆场景，镜头带出轻松互动。', '中景；环绕运镜', '陪伴每一程', '让每一次相聚，都有更从容的选择。', '温暖弦乐进入', '人物授权素材、节庆场景', '人物表情自然，避免遮挡产品。'],
        [5, '19–26秒', '功能卖点以动态图形叠加在真实场景上。', '俯拍转侧拍；信息叠加', '智能 · 安全 · 舒适', '智能、安全与舒适，为日常多一份笃定。', '节拍稳定；功能提示音', '卖点图标、真实使用场景', '三项卖点逐项出现，不超过两行字幕。'],
        [6, '26–34秒', '展示节日权益卡片与门店服务画面。', '卡片动效；镜头拉远', '圣灵节专属权益', '现在到店，即享圣灵节专属权益。', '权益弹出音', '权益文案、门店与服务素材', '权益内容需由营销团队最终确认。'],
        [7, '34–42秒', '产品在夜景灯光中行驶，视觉节奏上扬。', '低机位跟拍；慢动作', '点亮每一次出发', '当城市亮起，热爱正好出发。', '音乐进入高潮', '夜景行驶素材、灯光特效', '保留车身与环境反射质感。'],
        [8, '42–50秒', '回到家庭 / 用户互动，产品与生活场景同框。', '中远景；稳定器跟拍', '与重要的人 共赴新程', '把每一段旅程，变成值得分享的节日记忆。', '音乐温暖延续', '家庭互动、生活方式素材', '人物和产品同框比例约 6:4。'],
        [9, '50–56秒', '品牌标识与活动主张在节庆色彩中出现。', '定帧转图形动画', '圣灵节专场营销', '圣灵节专场营销，礼遇正在进行。', '品牌音效', '品牌 KV、活动主标题', '主标识停留至少 2 秒。'],
        [10, '56–60秒', '二维码、到店按钮和行动号召出现，画面淡出。', '静帧；轻微缩放', '立即预约试驾', '点击预约，开启你的节日新旅程。', '音乐收束；确认提示音', '二维码、预约按钮、落地页链接', '二维码需可扫；字幕和按钮均在安全区内。'],
    ]
    for row in rows:
        ws.append(row)
    style_table(ws, 3, 3 + len(rows), len(headers))
    widths = [8, 12, 34, 21, 23, 32, 22, 25, 31]
    for index, width in enumerate(widths, start=1):
        ws.column_dimensions[chr(64 + index)].width = width

    checklist = wb.create_sheet('执行清单')
    checklist.sheet_view.showGridLines = False
    checklist.freeze_panes = 'A4'
    add_title(checklist, '圣灵节专场视频执行清单', '按交付前、拍摄期和发布前三个阶段逐项确认，确保分镜可按时落地。', 5)
    checklist.append(['阶段', '检查项', '负责人岗位', '交付物', '状态'])
    checklist_rows = [
        ['交付前', '确认活动主张、权益和落地页信息', '数字营销师', '已确认活动文案', '待确认'],
        ['交付前', '确认品牌规范、字幕安全区和主视觉', '视觉设计师', '视觉规范确认单', '待确认'],
        ['拍摄期', '准备产品、场景、人物与授权素材', '视觉设计师', '素材清单', '待确认'],
        ['拍摄期', '按分镜完成镜头拍摄和收音', '视觉设计师', '原始素材包', '待确认'],
        ['剪辑期', '完成节奏剪辑、字幕、音乐和音效', '视觉设计师', '初版视频', '待确认'],
        ['发布前', '校验权益、二维码、链接和平台尺寸', '数字营销师', '发布检查表', '待确认'],
        ['发布前', '导出横版、竖版和封面图', '视觉设计师', '多规格成片与封面', '待确认'],
    ]
    for row in checklist_rows:
        checklist.append(row)
    style_table(checklist, 3, 3 + len(checklist_rows), 5)
    for column, width in {'A': 14, 'B': 42, 'C': 20, 'D': 30, 'E': 14}.items():
        checklist.column_dimensions[column].width = width

    wb.save(OUTPUT)
    print(OUTPUT)


if __name__ == '__main__':
    build_workbook()
