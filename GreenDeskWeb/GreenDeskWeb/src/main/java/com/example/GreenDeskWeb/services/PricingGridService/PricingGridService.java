package com.example.GreenDeskWeb.services.PricingGridService;

import com.example.GreenDeskWeb.dto.PriceCalculationRequestDTO;
import com.example.GreenDeskWeb.dto.PriceCalculationResultDTO;
import com.example.GreenDeskWeb.dto.PricingGridRequestDTO;
import com.example.GreenDeskWeb.dto.PricingGridResponseDTO;

public interface PricingGridService {
    PricingGridResponseDTO createForProduct(Long productId,
                                            PricingGridRequestDTO request) ;
    PricingGridResponseDTO updateForProduct(Long productId,
                                            PricingGridRequestDTO request) ;
    PricingGridResponseDTO getByProductId(Long productId) ;
    void deleteByProductId(Long productId) ;

    PriceCalculationResultDTO calculatePrice(Long productId,
                                             PriceCalculationRequestDTO request) ;






}
