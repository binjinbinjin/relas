package relas.java.service;

import relas.java.service.dto.UserPortfolioDTO;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * Service Interface for managing UserPortfolio.
 */
public interface UserPortfolioService {

    /**
     * Save a userPortfolio.
     *
     * @param userPortfolioDTO the entity to save
     * @return the persisted entity
     */
    UserPortfolioDTO save(UserPortfolioDTO userPortfolioDTO);

    /**
     * Get all the userPortfolios.
     *
     * @param pageable the pagination information
     * @return the list of entities
     */
    Page<UserPortfolioDTO> findAll(Pageable pageable);

    /**
     * Get the "id" userPortfolio.
     *
     * @param id the id of the entity
     * @return the entity
     */
    UserPortfolioDTO findOne(Long id);

    /**
     * Delete the "id" userPortfolio.
     *
     * @param id the id of the entity
     */
    void delete(Long id);

    /**
     * Search for the userPortfolio corresponding to the query.
     *
     * @param query the query of the search
     * 
     * @param pageable the pagination information
     * @return the list of entities
     */
    Page<UserPortfolioDTO> search(String query, Pageable pageable);
}