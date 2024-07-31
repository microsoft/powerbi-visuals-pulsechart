import powerbi from "powerbi-visuals-api";
import { formattingSettings } from "powerbi-visuals-utils-formattingmodel";
import { ValueFormatterOptions } from "powerbi-visuals-utils-formattingutils/lib/src/valueFormatter";
import { RunnerCounterPosition, XAxisDateFormat, XAxisPosition } from './enum/enums';
import { AnimationPosition } from './models/models';
import ILocalizationManager = powerbi.extensibility.ILocalizationManager;
import Model = formattingSettings.Model;
import Card = formattingSettings.SimpleCard;
import IEnumMember = powerbi.IEnumMember;

const xAxisPositionOptions: IEnumMember[] = [
    { value: XAxisPosition.Center, displayName: "Visual_Center" },
    { value: XAxisPosition.Bottom, displayName: "Visual_Bottom" },
];

const runnerCounterPositionOptions: IEnumMember[] = [
    { value: RunnerCounterPosition[RunnerCounterPosition.TopLeft], displayName: "Visual_TopLeft" },
    { value: RunnerCounterPosition[RunnerCounterPosition.TopRight], displayName: "Visual_TopRight" },
];

class SeriesSettingsCard extends Card {
    fill = new formattingSettings.ColorPicker({
        name: "fill",
        displayName: "Fill",
        displayNameKey: "Visual_Fill",
        value: { value: "#3779B7" },
    });

    width = new formattingSettings.NumUpDown({
        name: "width",
        displayName: "Width",
        displayNameKey: "Visual_Width",
        value: 2,
    });

    name: string = "series";
    displayName: string = "Series";
    displayNameKey: string = "Visual_Series";
    description: string = "Series";
    descriptionKey: string = "Visual_Series";
    slices = [this.fill, this.width];
}

class GapsSettingsCard extends Card {
    show = new formattingSettings.ToggleSwitch({
        name: "show",
        displayName: "Show",
        displayNameKey: "Visual_Show",
        value: false,
    });

    transparency = new formattingSettings.Slider({
        name: "transparency",
        displayName: "Visible gaps",
        displayNameKey: "Visual_PulseChart_VisibleGaps",
        value: 1,
    })

    name: string = "gaps";
    displayName: string = "Gaps";
    displayNameKey: string = "Visual_PulseChart_Gaps";
    description: string = "Gaps";
    descriptionKey: string = "Visual_PulseChart_Gaps";
    topLevelSlice = this.show;
    slices = [this.transparency];
}

class PopupSettingsCard extends Card {
    show = new formattingSettings.ToggleSwitch({
        name: "show",
        displayName: "Show",
        displayNameKey: "Visual_Show",
        value: true,
    });

    alwaysOnTop = new formattingSettings.ToggleSwitch({
        name: "alwaysOnTop",
        displayName: "Always on top",
        displayNameKey: "Visual_AlwaysTop",
        value: false,
    });

    width = new formattingSettings.NumUpDown({
        name: "width",
        displayName: "Width",
        displayNameKey: "Visual_Width",
        value: 100,
    });

    height = new formattingSettings.NumUpDown({
        name: "height",
        displayName: "Height",
        displayNameKey: "Visual_Height",
        value: 80,
    });

    color = new formattingSettings.ColorPicker({
        name: "color",
        displayName: "Fill",
        displayNameKey: "Visual_Fill",
        value: { value: "#808181" },
    });

    fontSize = new formattingSettings.NumUpDown({
        name: "fontSize",
        displayName: "Text size",
        displayNameKey: "Visual_TextSize",
        value: 10,
    });

    fontColor = new formattingSettings.ColorPicker({
        name: "fontColor",
        displayName: "Text color",
        displayNameKey: "Visual_TextColor",
        value: { value: "#ffffff" },
    });

    showTime = new formattingSettings.ToggleSwitch({
        name: "showTime",
        displayName: "Show time",
        displayNameKey: "Visual_PulseChart_ShowTime",
        value: true,
    });

    showTitle = new formattingSettings.ToggleSwitch({
        name: "showTitle",
        displayName: "Show title",
        displayNameKey: "Visual_ShowTitle",
        value: true,
    });

    timeColor = new formattingSettings.ColorPicker({
        name: "timeColor",
        displayName: "Time color",
        displayNameKey: "Visual_PulseChart_TimeColor",
        value: { value: "#ffffff" },
    })

    timeFill = new formattingSettings.ColorPicker({
        name: "timeFill",
        displayName: "Time fill",
        displayNameKey: "Visual_PulseChart_TimeFill",
        value: { value: "#010101" },
    })

    // TODO: Check if strokeColor is working as it was added recently
    strokeColor = new formattingSettings.ColorPicker({
        name: "strokeColor",
        displayName: "Stroke color",
        displayNameKey: "Visual_PulseChart_StrokeColor",
        value: { value: "#010101" },
    })

    name: string = "popup";
    displayName: string = "Popup";
    displayNameKey: string = "Visual_Popup";
    topLevelSlice = this.show;
    slices = [this.alwaysOnTop, this.width, this.height, this.color, this.fontSize, this.fontColor, this.showTime, this.showTitle, this.timeColor, this.timeFill, this.strokeColor];
}

class DotsSettingsCard extends Card {
    color = new formattingSettings.ColorPicker({
        name: "color",
        displayName: "Fill",
        displayNameKey: "Visual_Fill",
        value: { value: "#808181" },
    });

    minSize = new formattingSettings.NumUpDown({
        name: "minSize",
        displayName: "Min Size",
        displayNameKey: "Visual_MinSize",
        value: 5,
    });

    maxSize = new formattingSettings.NumUpDown({
        name: "maxSize",
        displayName: "Max Size",
        displayNameKey: "Visual_MaxSize",
        value: 20,
    });

    size = new formattingSettings.NumUpDown({
        name: "size",
        displayName: "Default Size",
        displayNameKey: "Visual_DefaultSize",
        value: 5,
    });

    transparency = new formattingSettings.Slider({
        name: "transparency",
        displayName: "Transparency",
        displayNameKey: "Visual_Transparency",
        value: 25,
    });

    name: string = "dots";
    displayName: string = "Dots";
    displayNameKey: string = "Visual_Dots";
    slices = [this.color, this.minSize, this.maxSize, this.size, this.transparency];
}

class XAxisSettingsCard extends Card {
    show = new formattingSettings.ToggleSwitch({
        name: "show",
        displayName: "Show",
        displayNameKey: "Visual_Show",
        value: true,
    });
    
    position = new formattingSettings.ItemDropdown({
        name: "position",
        displayName: "Position",
        displayNameKey: "Visual_Position",
        items: xAxisPositionOptions,
        value: xAxisPositionOptions[0],
    });

    fontColor = new formattingSettings.ColorPicker({
        name: "fontColor",
        displayName: "Font Color",
        displayNameKey: "Visual_FontColor",
        value: { value: "#777777" },
    });

    color = new formattingSettings.ColorPicker({
        name: "color",
        displayName: "Axis color",
        displayNameKey: "Visual_AxisColor",
        value: { value: "#777777" },
    });

    backgroundColor = new formattingSettings.ColorPicker({
        name: "backgroundColor",
        displayName: "Background Color",
        displayNameKey: "Visual_BackgroundColor",
        value: { value: "#E1F2F7" },
    });

    public dateFormat: XAxisDateFormat = XAxisDateFormat.TimeOnly;
    public formatterOptions?: ValueFormatterOptions;

    topLevelSlice = this.show;
    name: string = "xAxis";
    displayName: string = "X Axis";
    displayNameKey: string = "Visual_XAxis";
    slices = [this.position, this.fontColor, this.color, this.backgroundColor];
}

class YAxisSettingsCard extends Card {
    show = new formattingSettings.ToggleSwitch({
        name: "show",
        displayName: "Show",
        displayNameKey: "Visual_Show",
        value: true,
    });

    fontColor = new formattingSettings.ColorPicker({
        name: "fontColor",
        displayName: "Font Color",
        displayNameKey: "Visual_FontColor",
        value: { value: "#777777" },
    });

    color = new formattingSettings.ColorPicker({
        name: "color",
        displayName: "Axis color",
        displayNameKey: "Visual_AxisColor",
        value: { value: "#777777" },
    });

    public formatterOptions?: ValueFormatterOptions;

    topLevelSlice = this.show;
    name: string = "yAxis";
    displayName: string = "Y Axis";
    displayNameKey: string = "Visual_YAxis";
    slices = [this.fontColor, this.color];
}

class PlaybackSettingsCard extends Card {
    autoplay = new formattingSettings.ToggleSwitch({
        name: "autoplay",
        displayName: "Autoplay",
        displayNameKey: "Visual_PulseChart_Autoplay",
        value: false,
    });

    repeat = new formattingSettings.ToggleSwitch({
        name: "repeat",
        displayName: "Repeat",
        displayNameKey: "Visual_PulseChart_Repeat",
        value: false,
    });

    playSpeed = new formattingSettings.NumUpDown({
        name: "playSpeed",
        displayName: "Speed (dots/sec)",
        displayNameKey: "Visual_PulseChart_PlaySpeed",
        value: 5,
    });

    pauseDuration = new formattingSettings.NumUpDown({
        name: "pauseDuration",
        displayName: "Pause Duration",
        displayNameKey: "Visual_PulseChart_PauseDuration",
        value: 10,
    });

    autoplayPauseDuration = new formattingSettings.NumUpDown({
        name: "autoplayPauseDuration",
        displayName: "Start Delay",
        displayNameKey: "Visual_PulseChart_StartDelay",
        value: 0,
    });

    color = new formattingSettings.ColorPicker({
        name: "color",
        displayName: "Buttons color",
        displayNameKey: "Visual_PulseChart_ButtonsColor",
        value: { value: "#777777" },
    });

    public position: AnimationPosition | null = null;

    name: string = "playback";
    displayName: string = "Playback";
    displayNameKey: string = "Visual_PulseChart_Playback";
    slices = [this.autoplay, this.repeat, this.playSpeed, this.pauseDuration, this.autoplayPauseDuration, this.color];
}

class RunnerCounterSettingsCard extends Card {
    show = new formattingSettings.ToggleSwitch({
        name: "show",
        displayName: "Show",
        displayNameKey: "Visual_Show",
        value: true,
    });

    label = new formattingSettings.TextInput({
        name: "label",
        displayName: "Label",
        displayNameKey: "Visual_Label",
        value: "",
        placeholder: "",
    });

    position = new formattingSettings.ItemDropdown({
        name: "position",
        displayName: "Position",
        displayNameKey: "Visual_Position",
        items: runnerCounterPositionOptions,
        value: runnerCounterPositionOptions[0],
    });

    fontSize = new formattingSettings.NumUpDown({
        name: "Text size",
        displayName: "Visual_TextSize",
        value: 13,
    });

    fontColor = new formattingSettings.ColorPicker({
        name: "fontColor",
        displayName: "Font Color",
        displayNameKey: "Visual_FontColor",
        value: { value: "#777777" },
    });

    topLevelSlice = this.show;
    name: string = "runnerCounter";
    displayName: string = "Runner Counter";
    displayNameKey: string = "Visual_PulseChart_RunnerCounter";
    slices = [this.label, this.position, this.fontSize, this.fontColor];
}


export class PulseChartSettingsModel extends Model {
    series = new SeriesSettingsCard();
    gaps = new GapsSettingsCard();
    popup = new PopupSettingsCard();
    dots = new DotsSettingsCard();
    xAxis = new XAxisSettingsCard();
    yAxis = new YAxisSettingsCard();
    playback = new PlaybackSettingsCard();
    runnerCounter = new RunnerCounterSettingsCard();

    cards = [
        this.series,
        this.gaps,
        this.popup,
        this.dots,
        this.xAxis,
        this.yAxis,
        this.playback,
        this.runnerCounter,
    ];

    public setLocalizedOptions(localizationManager: ILocalizationManager) {
        this.setLocalizedDisplayName(xAxisPositionOptions, localizationManager);
        this.setLocalizedDisplayName(runnerCounterPositionOptions, localizationManager);
    }

    private setLocalizedDisplayName(options: IEnumMember[], localizationManager: ILocalizationManager) {
        options.forEach((option: IEnumMember) => {
            option.displayName = localizationManager.getDisplayName(option.displayName.toString());
        });
    }
}