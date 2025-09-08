package com.financeapp.service;

import com.financeapp.entity.ForecastConfig;
import com.financeapp.entity.ForecastResult;

import java.time.LocalDate;
import java.util.List;
import java.util.concurrent.CompletableFuture;

public interface ForecastService {

    CompletableFuture<List<ForecastResult>> generateForecast(Long userId, ForecastConfig config, LocalDate startDate, int horizonDays);

    double[] simpleMovingAverage(List<Double> values, int window);

    double[] exponentialWeightedMovingAverage(List<Double> values, double alpha);

    double[] linearRegressionForecast(List<Double> values, int horizon);

    double[] seasonalDecomposition(List<Double> values, int seasonLength, int horizon);
}


