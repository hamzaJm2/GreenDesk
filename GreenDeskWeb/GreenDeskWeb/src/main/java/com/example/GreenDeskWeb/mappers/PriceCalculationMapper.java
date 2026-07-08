package com.example.GreenDeskWeb.mappers;

import com.example.GreenDeskWeb.dto.PriceCalculationResultDTO;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.math.BigDecimal;
import java.util.List;

@Mapper(componentModel = "spring")
public interface PriceCalculationMapper {

    @Mapping(target = "qty", source = "qty")
    @Mapping(target = "unitBasePrice", source = "unitBasePrice")
    @Mapping(target = "unitOptionSurcharge", source = "unitOptionSurcharge")
    @Mapping(target = "unitTax", source = "unitTax")
    @Mapping(target = "unitTotal", source = "unitTotal")
    @Mapping(target = "subtotal", source = "subtotal")
    @Mapping(target = "shippingCost", source = "shippingCost")
    @Mapping(target = "grandTotal", source = "grandTotal")
    @Mapping(target = "selectedOptions", source = "selectedOptions")
    @Mapping(target = "zone", source = "zone")
    PriceCalculationResultDTO valuesToPriceCalculationResultDTO(
            int qty,
            BigDecimal unitBasePrice,
            BigDecimal unitOptionSurcharge,
            BigDecimal unitTax,
            BigDecimal unitTotal,
            BigDecimal subtotal,
            BigDecimal shippingCost,
            BigDecimal grandTotal,
            List<String> selectedOptions,
            String zone
    );
}