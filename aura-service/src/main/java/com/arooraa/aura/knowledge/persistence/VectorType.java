package com.arooraa.aura.knowledge.persistence;

import com.pgvector.PGvector;
import org.hibernate.type.descriptor.WrapperOptions;
import org.hibernate.usertype.UserType;

import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Types;
import java.util.Arrays;

/**
 * Maps a Java {@code float[]} to Postgres' pgvector {@code vector} column type — deliberately a
 * small, inspectable custom type rather than a full vector-store framework, so an embedding is
 * just another JPA column (see {@link com.arooraa.aura.knowledge.domain.AuraEmbedding}).
 *
 * <p>{@code getSqlType() = Types.OTHER} is the standard way to make Hibernate's schema validator
 * (this service runs {@code ddl-auto: validate}, DDL itself lives in Flyway) accept a
 * database-specific column type it doesn't otherwise know about, without registering
 * {@code vector} as a connection-level type (which would be fragile under connection pooling).
 * Reading/writing goes through pgvector-java's text format ({@code [0.1,0.2,...]}), which needs
 * no such registration either.
 */
public class VectorType implements UserType<float[]> {

    @Override
    public int getSqlType() {
        return Types.OTHER;
    }

    @Override
    public Class<float[]> returnedClass() {
        return float[].class;
    }

    @Override
    public boolean equals(float[] x, float[] y) {
        return Arrays.equals(x, y);
    }

    @Override
    public int hashCode(float[] x) {
        return Arrays.hashCode(x);
    }

    @Override
    public float[] nullSafeGet(ResultSet rs, int position, WrapperOptions options) throws SQLException {
        String raw = rs.getString(position);
        if (raw == null) {
            return null;
        }
        return new PGvector(raw).toArray();
    }

    @Override
    public void nullSafeSet(PreparedStatement st, float[] value, int index, WrapperOptions options) throws SQLException {
        if (value == null) {
            st.setNull(index, Types.OTHER);
        } else {
            st.setObject(index, new PGvector(value));
        }
    }

    @Override
    public float[] deepCopy(float[] value) {
        return value == null ? null : value.clone();
    }

    @Override
    public boolean isMutable() {
        return true;
    }
}
