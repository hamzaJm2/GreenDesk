package com.example.GreenDeskWeb.services;


import com.example.GreenDeskWeb.entites.PackagingColorGroup;
import com.example.GreenDeskWeb.entites.PackagingLogoZone;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class PackagingSvgParserService {

    private static final Pattern VIEWBOX_PATTERN =
            Pattern.compile("viewBox=\"\\s*[\\d.\\-]+\\s+[\\d.\\-]+\\s+([\\d.]+)\\s+([\\d.]+)\\s*\"");

    private static final Pattern ID_PATTERN = Pattern.compile("id=\"([^\"]+)\"");

    private static final Pattern FILL_ATTR_PATTERN = Pattern.compile("fill=\"(#[0-9a-fA-F]{3,6})\"");
    private static final Pattern FILL_STYLE_PATTERN = Pattern.compile("fill:\\s*(#[0-9a-fA-F]{3,6})");

    public static final String COLOR_PREFIX = "editable-color__";
    public static final String LOGO_ZONE_PREFIX = "logo-zone__";

    public record ParsedSvg(
            Double viewBoxWidth,
            Double viewBoxHeight,
            List<PackagingColorGroup> colorGroups,
            List<PackagingLogoZone> logoZones
    ) {}

    public ParsedSvg parse(String svgContent) {
        double width = 0;
        double height = 0;
        Matcher vb = VIEWBOX_PATTERN.matcher(svgContent);
        if (vb.find()) {
            width = Double.parseDouble(vb.group(1));
            height = Double.parseDouble(vb.group(2));
        }

        Set<String> seenIds = new LinkedHashSet<>();
        Matcher idMatcher = ID_PATTERN.matcher(svgContent);
        while (idMatcher.find()) {
            seenIds.add(idMatcher.group(1));
        }

        List<PackagingColorGroup> colorGroups = new ArrayList<>();
        List<PackagingLogoZone> logoZones = new ArrayList<>();

        int colorOrder = 0;
        int zoneOrder = 0;

        for (String id : seenIds) {
            if (id.startsWith(COLOR_PREFIX)) {
                String suffix = id.substring(COLOR_PREFIX.length());
                colorGroups.add(PackagingColorGroup.builder()
                        .svgGroupId(id)
                        .label(humanize(suffix))
                        .defaultColorHex(extractNearestFillColor(svgContent, id))
                        .displayOrder(colorOrder++)
                        .build());
            } else if (id.startsWith(LOGO_ZONE_PREFIX)) {
                String suffix = id.substring(LOGO_ZONE_PREFIX.length());
                logoZones.add(PackagingLogoZone.builder()
                        .svgGroupId(id)
                        .label(humanize(suffix))
                        .displayOrder(zoneOrder++)
                        .build());
            }
        }

        return new ParsedSvg(width, height, colorGroups, logoZones);
    }

    private String humanize(String suffix) {
        String spaced = suffix.replace('-', ' ').replace('_', ' ');
        if (spaced.isBlank()) return spaced;
        return Character.toUpperCase(spaced.charAt(0)) + spaced.substring(1);
    }

    private String extractNearestFillColor(String svgContent, String groupId) {
        int idIndex = svgContent.indexOf("id=\"" + groupId + "\"");
        if (idIndex == -1) return null;

        int window = Math.min(svgContent.length(), idIndex + 4000);
        String slice = svgContent.substring(idIndex, window);

        Matcher fillAttr = FILL_ATTR_PATTERN.matcher(slice);
        if (fillAttr.find()) return fillAttr.group(1);

        Matcher fillStyle = FILL_STYLE_PATTERN.matcher(slice);
        if (fillStyle.find()) return fillStyle.group(1);

        return null;
    }
}